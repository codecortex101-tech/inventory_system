import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Response } from 'express';

@Controller('exports')
@UseGuards(JwtAuthGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('products')
  async exportProducts(
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
  ) {
    const csv = await this.exportsService.exportProducts(
      search,
      categoryId,
      status,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=products-${new Date().toISOString()}.csv`,
    );
    res.send(csv);
  }

  @Get('history')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async exportHistory(
    @Res() res: Response,
    @CurrentUser() user: any,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const csv = await this.exportsService.exportHistory(
      user.organizationId,
      entityType,
      action,
      startDate,
      endDate,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=history-${new Date().toISOString().split('T')[0]}.csv`,
    );
    res.send(csv);
  }

  @Get('stock-history')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async exportStockHistory(
    @Res() res: Response,
    @CurrentUser() user: any,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const csv = await this.exportsService.exportStockHistory(
      user.organizationId,
      type,
      startDate,
      endDate,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=stock-history-${new Date().toISOString().split('T')[0]}.csv`,
    );
    res.send(csv);
  }
}
