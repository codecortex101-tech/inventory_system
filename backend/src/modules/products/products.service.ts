import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(createProductDto: CreateProductDto, organizationId: string, userId: string) {
    // Check if SKU already exists in this organization
    const existingSku = await this.prisma.product.findFirst({
      where: { 
        sku: createProductDto.sku,
        organizationId: organizationId,
      },
    });

    if (existingSku) {
      throw new ConflictException('Product with this SKU already exists');
    }

    // Verify category exists in this organization
    const category = await this.prisma.category.findFirst({
      where: { 
        id: createProductDto.categoryId,
        organizationId: organizationId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        expirationDate: createProductDto.expirationDate ? new Date(createProductDto.expirationDate) : null,
        organizationId: organizationId,
      },
      include: {
        category: true,
      },
    });

    // Create audit log
    await this.auditLogService.createLog({
      userId,
      organizationId,
      action: 'CREATE',
      entityType: 'Product',
      entityId: product.id,
      description: `Product "${product.name}" (SKU: ${product.sku}) created`,
    }).catch(() => {}); // Don't fail if audit log fails

    return product;
  }

  async findAll(
    organizationId: string, 
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    categoryId?: string, 
    status?: string,
    expired?: boolean,
    expiringSoon?: boolean,
    activeExpiration?: boolean,
    hasExpirationDate?: boolean,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      organizationId: organizationId, // Filter by organization
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    // Expiration date filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Build expiration date filter
    if (expired === true) {
      where.expirationDate = {
        lt: today,
        not: null,
      };
    } else if (expiringSoon === true) {
      where.expirationDate = {
        gte: today,
        lte: thirtyDaysFromNow,
        not: null,
      };
    } else if (activeExpiration === true) {
      where.expirationDate = {
        gt: thirtyDaysFromNow,
        not: null,
      };
    } else if (hasExpirationDate === true) {
      where.expirationDate = { not: null };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId: string) {
    const product = await this.prisma.product.findFirst({
      where: { 
        id: id,
        organizationId: organizationId,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, organizationId: string, userId: string) {
    const oldProduct = await this.findOne(id, organizationId);

    // Check SKU uniqueness if updating SKU
    if (updateProductDto.sku && updateProductDto.sku !== oldProduct.sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: { 
          sku: updateProductDto.sku,
          organizationId: organizationId,
        },
      });

      if (existingSku) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    // Verify category exists if updating category
    if (updateProductDto.categoryId && updateProductDto.categoryId !== oldProduct.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { 
          id: updateProductDto.categoryId,
          organizationId: organizationId,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Prevent direct stock update - currentStock is already excluded from UpdateProductDto
    // No need to check as it's not in the DTO type

    const updateData: any = { ...updateProductDto };
    if (updateProductDto.expirationDate !== undefined) {
      updateData.expirationDate = updateProductDto.expirationDate ? new Date(updateProductDto.expirationDate) : null;
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    // Create audit log
    const changes: string[] = [];
    if (updateProductDto.name && updateProductDto.name !== oldProduct.name) {
      changes.push(`Name: "${oldProduct.name}" → "${updateProductDto.name}"`);
    }
    if (updateProductDto.sku && updateProductDto.sku !== oldProduct.sku) {
      changes.push(`SKU: "${oldProduct.sku}" → "${updateProductDto.sku}"`);
    }
    if (updateProductDto.status && updateProductDto.status !== oldProduct.status) {
      changes.push(`Status: "${oldProduct.status}" → "${updateProductDto.status}"`);
      await this.auditLogService.createLog({
        userId,
        organizationId,
        action: 'STATUS_CHANGE',
        entityType: 'Product',
        entityId: id,
        description: `Product "${updatedProduct.name}" status changed`,
        oldValue: oldProduct.status,
        newValue: updateProductDto.status,
      }).catch(() => {});
    }

    if (changes.length > 0) {
      await this.auditLogService.createLog({
        userId,
        organizationId,
        action: 'UPDATE',
        entityType: 'Product',
        entityId: id,
        description: `Product "${updatedProduct.name}" updated: ${changes.join(', ')}`,
      }).catch(() => {});
    }

    return updatedProduct;
  }

  async remove(id: string, organizationId: string, userId: string) {
    const product = await this.findOne(id, organizationId);

    // Check if product has stock movements
    const stockMovements = await this.prisma.stockMovement.findFirst({
      where: {
        productId: id,
        organizationId: organizationId,
      },
    });

    if (stockMovements) {
      // If there are stock movements, delete them first (cascade delete)
      await this.prisma.stockMovement.deleteMany({
        where: {
          productId: id,
          organizationId: organizationId,
        },
      });
    }

    // Hard delete the product
    const deletedProduct = await this.prisma.product.delete({
      where: { id },
    });

    // Create audit log
    await this.auditLogService.createLog({
      userId,
      organizationId,
      action: 'DELETE',
      entityType: 'Product',
      entityId: id,
      description: `Product "${deletedProduct.name}" (SKU: ${deletedProduct.sku}) deleted`,
    }).catch(() => {});

    return deletedProduct;
  }

  async getLowStockProducts(organizationId: string) {
    const products = await this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        organizationId: organizationId,
      },
      include: {
        category: true,
      },
    });

    // Filter products where currentStock <= minimumStock
    return products.filter(
      (product) => product.currentStock <= product.minimumStock,
    );
  }

  async getOutOfStockProducts(organizationId: string) {
    return this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        currentStock: 0,
        organizationId: organizationId,
      },
      include: {
        category: true,
      },
    });
  }

  async getExpirationStatistics(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const allProducts = await this.prisma.product.findMany({
      where: {
        organizationId: organizationId,
        expirationDate: { not: null },
      },
      include: {
        category: true,
      },
    });

    const expiredProducts = allProducts.filter(
      (product) => product.expirationDate && new Date(product.expirationDate) < today
    );

    const expiringSoonProducts = allProducts.filter(
      (product) => 
        product.expirationDate && 
        new Date(product.expirationDate) >= today && 
        new Date(product.expirationDate) <= thirtyDaysFromNow
    );

    const activeProducts = allProducts.filter(
      (product) => 
        product.expirationDate && 
        new Date(product.expirationDate) > thirtyDaysFromNow
    );

    return {
      total: allProducts.length,
      expired: expiredProducts.length,
      expiringSoon: expiringSoonProducts.length,
      active: activeProducts.length,
      expiredProducts: expiredProducts,
      expiringSoonProducts: expiringSoonProducts,
      activeProducts: activeProducts,
    };
  }
}
