import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findAllInOrganization(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteUser(userId: string, organizationId: string, currentUserId: string) {
    // Prevent self-deletion
    if (userId === currentUserId) {
      throw new UnauthorizedException('Cannot delete your own account');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: organizationId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting the last admin
    if (user.role === 'ADMIN') {
      const adminCount = await this.prisma.user.count({
        where: {
          organizationId: organizationId,
          role: 'ADMIN',
        },
      });

      if (adminCount <= 1) {
        throw new UnauthorizedException('Cannot delete the last admin user');
      }
    }

    const deletedUser = await this.prisma.user.delete({
      where: { id: userId },
    });

    // Create audit log
    await this.auditLogService.createLog({
      userId: currentUserId,
      organizationId,
      action: 'DELETE',
      entityType: 'User',
      entityId: userId,
      description: `User "${deletedUser.name}" (${deletedUser.email}) deleted`,
    }).catch(() => {});

    return deletedUser;
  }
}
