import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateAuditLogDto {
  userId: string;
  organizationId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'STOCK_MOVEMENT' | 'STATUS_CHANGE';
  entityType: string;
  entityId?: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async createLog(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        userId: dto.userId,
        organizationId: dto.organizationId,
        action: dto.action,
        entityType: dto.entityType,
        entityId: dto.entityId,
        description: dto.description,
        oldValue: dto.oldValue,
        newValue: dto.newValue,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      },
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
  }

  async findAll(organizationId: string, page: number = 1, limit: number = 50, userId?: string, action?: string, entityType?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      organizationId: organizationId,
    };

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
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
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
