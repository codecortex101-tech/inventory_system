import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { FacebookStrategy } from './facebook.strategy';
import { UsersModule } from '../users/users.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    UsersModule,
    AuditLogModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy,
    // Only provide strategies if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && 
        process.env.GOOGLE_CLIENT_SECRET && 
        process.env.GOOGLE_CLIENT_ID !== 'dummy-client-id' && 
        process.env.GOOGLE_CLIENT_SECRET !== 'dummy-client-secret' 
        ? [GoogleStrategy] : []),
    ...(process.env.FACEBOOK_APP_ID && 
        process.env.FACEBOOK_APP_SECRET && 
        process.env.FACEBOOK_APP_ID !== 'dummy-app-id' && 
        process.env.FACEBOOK_APP_SECRET !== 'dummy-app-secret' 
        ? [FacebookStrategy] : []),
  ],
  exports: [AuthService],
})
export class AuthModule {}
