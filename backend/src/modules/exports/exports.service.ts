import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExportsService {
  constructor(private prisma: PrismaService) {}

  async exportProducts(search?: string, categoryId?: string, status?: string) {
    const where: any = {};

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

    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Convert to CSV format
    const headers = [
      'ID',
      'Name',
      'SKU',
      'Category',
      'Description',
      'Cost Price',
      'Selling Price',
      'Current Stock',
      'Minimum Stock',
      'Unit',
      'Status',
      'Created At',
      'Updated At',
    ];

    const rows = products.map((product) => [
      product.id,
      product.name,
      product.sku,
      product.category.name,
      product.description || '',
      product.costPrice.toString(),
      product.sellingPrice.toString(),
      product.currentStock.toString(),
      product.minimumStock.toString(),
      product.unit,
      product.status,
      product.createdAt.toISOString(),
      product.updatedAt.toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  async exportHistory(
    organizationId: string,
    entityType?: string,
    action?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {
      organizationId: organizationId,
    };

    if (entityType) {
      where.entityType = entityType;
    }

    if (action) {
      where.action = action;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const auditLogs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const headers = [
      'Date',
      'Time',
      'User Name',
      'User Email',
      'User Role',
      'Action',
      'Entity Type',
      'Entity ID',
      'Description',
      'Old Value',
      'New Value',
    ];

    const rows = auditLogs.map((log) => [
      new Date(log.createdAt).toLocaleDateString('en-US'),
      new Date(log.createdAt).toLocaleTimeString('en-US'),
      log.user.name,
      log.user.email,
      log.user.role,
      log.action,
      log.entityType,
      log.entityId || '',
      log.description,
      log.oldValue || '',
      log.newValue || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csv;
  }

  async exportStockHistory(
    organizationId: string,
    type?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {
      organizationId: organizationId,
    };

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const movements = await this.prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            category: true,
          },
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
    });

    const headers = [
      'Date',
      'Time',
      'Product Name',
      'SKU',
      'Category',
      'Type',
      'Quantity',
      'Reason',
      'User Name',
      'User Email',
      'User Role',
    ];

    const rows = movements.map((movement) => [
      new Date(movement.createdAt).toLocaleDateString('en-US'),
      new Date(movement.createdAt).toLocaleTimeString('en-US'),
      movement.product.name,
      movement.product.sku,
      movement.product.category?.name || 'N/A',
      movement.type,
      movement.quantity.toString(),
      movement.reason,
      movement.user.name,
      movement.user.email,
      movement.user.role || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csv;
  }
}
