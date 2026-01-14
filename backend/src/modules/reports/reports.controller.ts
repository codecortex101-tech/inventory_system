import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('low-stock')
  getLowStock(@CurrentUser() user: any) {
    return this.reportsService.getLowStockReport(user.organizationId);
  }

  @Get('stock-summary')
  getStockSummary(@CurrentUser() user: any) {
    return this.reportsService.getStockSummary(user.organizationId);
  }

  @Get('volume-today')
  getVolumeToday(@CurrentUser() user: any) {
    return this.reportsService.getVolumeTodayMetrics(user.organizationId);
  }

  @Get('monthly-kpis')
  getMonthlyKPIs(@CurrentUser() user: any) {
    return this.reportsService.getMonthlyKPIs(user.organizationId);
  }

  @Get('financial-performance')
  getFinancialPerformance(@CurrentUser() user: any) {
    return this.reportsService.getFinancialPerformance(user.organizationId);
  }

  @Get('inventory-distribution')
  getInventoryDistribution(@CurrentUser() user: any) {
    return this.reportsService.getInventoryDistribution(user.organizationId);
  }

}
