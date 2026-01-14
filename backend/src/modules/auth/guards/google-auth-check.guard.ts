import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class GoogleAuthCheckGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();
    
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const googleClientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    
    // Check if OAuth credentials are configured
    if (!googleClientId || !googleClientSecret || 
        googleClientId === 'dummy-client-id' || 
        googleClientSecret === 'dummy-client-secret' ||
        googleClientId === '' || 
        googleClientSecret === '') {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
      response.redirect(`${frontendUrl}/login?error=oauth_not_configured&provider=google`);
      return false;
    }
    
    return true;
  }
}
