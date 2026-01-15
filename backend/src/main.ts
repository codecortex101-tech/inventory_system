import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { PrismaService } from './prisma/prisma.service';

const logger = new Logger('Bootstrap');

function validateEnvironment() {
  const required =
    process.env.NODE_ENV === 'production'
      ? []
      : ['DATABASE_URL'];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

async function bootstrap() {
  try {
    validateEnvironment();

    const app = await NestFactory.create(AppModule, {
      logger:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn', 'log']
          : ['error', 'warn', 'log', 'debug'],
    });

    app.useGlobalFilters(new AllExceptionsFilter());

    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api');

    // Optional DB health check (safe)
    try {
      const prisma = app.get(PrismaService);
      await prisma.$queryRaw`SELECT 1`;
      logger.log('✅ Database connection verified');
    } catch (err) {
      logger.warn('⚠️ Database not reachable at startup');
    }

    const port = Number(process.env.PORT) || 4000;
    await app.listen(port);

    logger.log(`🚀 Server running on port ${port}`);
  } catch (error: any) {
    logger.error('❌ Application failed to start');
    logger.error(error.message);
    process.exit(1);
  }
}

bootstrap();
