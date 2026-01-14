import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, organizationId: string, userId: string) {
    const existing = await this.prisma.category.findFirst({
      where: { 
        name: createCategoryDto.name,
        organizationId: organizationId,
      },
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        organizationId: organizationId,
      },
    });

    // Create audit log
    await this.auditLogService.createLog({
      userId,
      organizationId,
      action: 'CREATE',
      entityType: 'Category',
      entityId: category.id,
      description: `Category "${category.name}" created`,
    }).catch(() => {});

    return category;
  }

  async findAll(organizationId: string) {
    return this.prisma.category.findMany({
      where: { organizationId: organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const category = await this.prisma.category.findFirst({
      where: { 
        id: id,
        organizationId: organizationId,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, organizationId: string, userId: string) {
    const oldCategory = await this.findOne(id, organizationId);

    if (updateCategoryDto.name && updateCategoryDto.name !== oldCategory.name) {
      const existing = await this.prisma.category.findFirst({
        where: { 
          name: updateCategoryDto.name,
          organizationId: organizationId,
        },
      });

      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    // Create audit log
    const changes: string[] = [];
    if (updateCategoryDto.name && updateCategoryDto.name !== oldCategory.name) {
      changes.push(`Name: "${oldCategory.name}" → "${updateCategoryDto.name}"`);
    }

    if (changes.length > 0) {
      await this.auditLogService.createLog({
        userId,
        organizationId,
        action: 'UPDATE',
        entityType: 'Category',
        entityId: id,
        description: `Category "${updatedCategory.name}" updated: ${changes.join(', ')}`,
        oldValue: oldCategory.name,
        newValue: updatedCategory.name,
      }).catch(() => {});
    }

    return updatedCategory;
  }

  async remove(id: string, organizationId: string, userId: string) {
    const category = await this.findOne(id, organizationId);

    const productCount = await this.prisma.product.count({
      where: { 
        categoryId: id,
        organizationId: organizationId,
      },
    });

    if (productCount > 0) {
      throw new ConflictException(
        `Cannot delete category. ${productCount} product(s) are using this category.`,
      );
    }

    const deletedCategory = await this.prisma.category.delete({
      where: { id },
    });

    // Create audit log
    await this.auditLogService.createLog({
      userId,
      organizationId,
      action: 'DELETE',
      entityType: 'Category',
      entityId: id,
      description: `Category "${deletedCategory.name}" deleted`,
    }).catch(() => {});

    return deletedCategory;
  }
}
