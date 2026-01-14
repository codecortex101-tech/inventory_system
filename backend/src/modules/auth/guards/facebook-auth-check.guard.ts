import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class FacebookAuthCheckGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();
    
    const facebookAppId = this.configService.get<string>('FACEBOOK_APP_ID');
    const facebookAppSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');
    
    // Check if OAuth credentials are configured
    if (!facebookAppId || !facebookAppSecret || 
        facebookAppId === 'dummy-app-id' || 
        facebookAppSecret === 'dummy-app-secret' ||
        facebookAppId === '' || 
        facebookAppSecret === '') {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
      response.redirect(`${frontendUrl}/login?error=oauth_not_configured&provider=facebook`);
      return false;
    }
    
    return true;
  }
}
