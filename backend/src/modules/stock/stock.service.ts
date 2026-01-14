import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class StockService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async createMovement(createStockMovementDto: CreateStockMovementDto, userId: string, organizationId: string) {
    const product = await this.prisma.product.findFirst({
      where: { 
        id: createStockMovementDto.productId,
        organizationId: organizationId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let quantityChange = createStockMovementDto.quantity;

    // For OUT movements, quantity should be negative
    if (createStockMovementDto.type === 'OUT') {
      if (quantityChange > 0) {
        quantityChange = -quantityChange;
      }

      // Check if stock will go negative
      if (product.currentStock + quantityChange < 0) {
        throw new BadRequestException(
          `Insufficient stock. Current stock: ${product.currentStock}, Requested: ${Math.abs(quantityChange)}`,
        );
      }
    } else if (createStockMovementDto.type === 'IN') {
      // For IN movements, ensure quantity is positive
      if (quantityChange < 0) {
        quantityChange = Math.abs(quantityChange);
      }
    } else if (createStockMovementDto.type === 'ADJUSTMENT') {
      // For ADJUSTMENT, calculate the difference
      const targetStock = createStockMovementDto.quantity;
      if (targetStock < 0) {
        throw new BadRequestException('Target stock cannot be negative for adjustment');
      }
      quantityChange = targetStock - product.currentStock;
      // If quantity change is 0, no adjustment needed
      if (quantityChange === 0) {
        throw new BadRequestException('Target stock is same as current stock. No adjustment needed.');
      }
    }

    // Create stock movement and update product stock in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          productId: createStockMovementDto.productId,
          organizationId: organizationId,
          quantity: quantityChange,
          type: createStockMovementDto.type,
          reason: createStockMovementDto.reason,
          userId: userId,
        },
      });

      const updatedProduct = await tx.product.update({
        where: { id: createStockMovementDto.productId },
        data: {
          currentStock: {
            increment: quantityChange,
          },
        },
        include: {
          category: true,
        },
      });

      return { movement, product: updatedProduct };
    });

    // Create audit log for stock movement
    await this.auditLogService.createLog({
      userId,
      organizationId,
      action: 'STOCK_MOVEMENT',
      entityType: 'StockMovement',
      entityId: result.movement.id,
      description: `Stock ${createStockMovementDto.type === 'IN' ? 'added' : createStockMovementDto.type === 'OUT' ? 'removed' : 'adjusted'} for product "${result.product.name}": ${Math.abs(quantityChange)} units. Reason: ${createStockMovementDto.reason}`,
      oldValue: (result.product.currentStock - quantityChange).toString(),
      newValue: result.product.currentStock.toString(),
    }).catch(() => {});

    return result.movement;
  }

  async getMovementsHistory(organizationId: string, page: number = 1, limit: number = 100, productId?: string, type?: string, startDate?: string, endDate?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      organizationId: organizationId,
    };

    if (productId) {
      where.productId = productId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.createdAt.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [movements, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      data: movements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
