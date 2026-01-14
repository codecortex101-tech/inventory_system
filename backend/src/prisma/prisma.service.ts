import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error: any) {
      this.logger.error('❌ Failed to connect to database:', error.message);
      this.logger.error('💡 Please check your DATABASE_URL in .env file');
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('✅ Database disconnected successfully');
    } catch (error: any) {
      this.logger.error('❌ Error disconnecting from database:', error.message);
    }
  }

  // Helper method for health checks
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }
}
