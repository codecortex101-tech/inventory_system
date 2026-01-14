import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { StockModule } from './modules/stock/stock.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ExportsModule } from './modules/exports/exports.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    StockModule,
    ReportsModule,
    ExportsModule,
    AuditLogModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
