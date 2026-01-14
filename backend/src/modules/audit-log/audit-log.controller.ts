import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @CurrentUser() user?: any,
  ) {
    return this.auditLogService.findAll(
      user.organizationId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      userId,
      action,
      entityType,
    );
  }

  @Get('history')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getHistory(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
  ) {
    return this.auditLogService.findAll(
      user.organizationId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 100,
      undefined,
      action,
      entityType,
    );
  }
}
