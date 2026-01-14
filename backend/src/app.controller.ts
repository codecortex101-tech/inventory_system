import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      message: 'Inventory Management System API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth/login',
        products: '/api/products',
        categories: '/api/categories',
        stock: '/api/stock/move',
        reports: '/api/reports/stock-summary',
      },
    };
  }

  @Get('health')
  async health() {
    const dbHealthy = await this.prismaService.isHealthy();
    
    return {
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbHealthy ? 'connected' : 'disconnected',
        api: 'running',
      },
    };
  }
}
