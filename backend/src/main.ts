import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { PrismaService } from './prisma/prisma.service';

const logger = new Logger('Bootstrap');

// Validate environment variables
function validateEnvironment() {
  const required = ['DATABASE_URL'];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    logger.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    logger.error('💡 Please create a .env file with required variables');
    process.exit(1);
  }

  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    logger.warn('⚠️  DATABASE_URL should start with postgresql:// or postgres://');
  }
}

// Find available port
async function findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
  const net = await import('net');
  
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const isAvailable = await new Promise<boolean>((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      server.on('error', () => resolve(false));
    });
    
    if (isAvailable) {
      return port;
    }
  }
  
  throw new Error(`Could not find available port starting from ${startPort}`);
}

async function bootstrap() {
  try {
    // Validate environment
    validateEnvironment();
    logger.log('✅ Environment variables validated');

    // Create app with custom logger to suppress NestJS internal errors
    const app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn', 'log'] 
        : ['error', 'warn', 'log', 'debug'],
    });

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());
    logger.log('✅ Global exception filter configured');

    // Enable CORS
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    app.enableCors({
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        frontendUrl,
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    logger.log('✅ CORS enabled');

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        disableErrorMessages: false,
      }),
    );
    logger.log('✅ Global validation pipe configured');

    // Global prefix
    app.setGlobalPrefix('api');
    logger.log('✅ API prefix set to /api');

    // Check database connection
    try {
      const prismaService = app.get(PrismaService);
      const isHealthy = await prismaService.isHealthy();
      if (!isHealthy) {
        throw new Error('Database health check failed');
      }
      logger.log('✅ Database connection verified');
    } catch (error: any) {
      logger.error('❌ Database connection failed:', error.message);
      logger.error('💡 Please check your DATABASE_URL and ensure PostgreSQL is running');
      throw error;
    }

    // Get port and check availability first
    const defaultPort = parseInt(process.env.PORT || '4000', 10);
    
    // Check if default port is available, if not find available port
    let port = defaultPort;
    const net = await import('net');
    const isDefaultPortAvailable = await new Promise<boolean>((resolve) => {
      const server = net.createServer();
      server.listen(defaultPort, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      server.on('error', () => resolve(false));
    });

    if (!isDefaultPortAvailable) {
      // Silently find available port without showing error
      try {
        port = await findAvailablePort(defaultPort);
        if (port !== defaultPort) {
          logger.log(`ℹ️  Port ${defaultPort} is busy, using port ${port} instead`);
        }
      } catch (findPortError: any) {
        logger.error(`❌ Error: Could not find available port starting from ${defaultPort}`);
        logger.error(`💡 Please free up ports ${defaultPort}-${defaultPort + 9} or set a different PORT in .env`);
        process.exit(1);
      }
    }

    // Start server on available port (should not fail since we checked availability)
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}/api`);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('SIGINT received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });
  } catch (error: any) {
    logger.error('❌ Failed to bootstrap the application:', error.message);
    if (error.stack) {
      logger.error(error.stack);
    }
    process.exit(1);
  }
}

bootstrap();
