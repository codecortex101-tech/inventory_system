import { Controller, Post, Body, UseGuards, Request, Get, Req, Res, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { GoogleAuthCheckGuard } from './guards/google-auth-check.guard';
import { FacebookAuthCheckGuard } from './guards/facebook-auth-check.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      // Validate input (DTO validation will handle this, but double-check for safety)
      if (!loginDto.organizationName || !loginDto.email || !loginDto.password) {
        throw new BadRequestException('Organization name, email, and password are required');
      }

      // Trim inputs to avoid whitespace issues
      loginDto.organizationName = loginDto.organizationName.trim();
      loginDto.email = loginDto.email.trim().toLowerCase();

      // Call service
      const result = await this.authService.login(loginDto);
      
      return result;
    } catch (error: any) {
      // Handle known errors gracefully
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      // For any other errors, throw a generic message
      throw new UnauthorizedException(error.message || 'Login failed. Please check your credentials.');
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      // Validate input (DTO validation will handle this, but double-check for safety)
      if (!registerDto.email || !registerDto.password || !registerDto.name || !registerDto.organizationName) {
        throw new BadRequestException('Email, password, name, and organization name are required');
      }

      // Trim inputs to avoid whitespace issues
      registerDto.organizationName = registerDto.organizationName.trim();
      registerDto.email = registerDto.email.trim().toLowerCase();

      // Public registration - creates new organization
      return await this.authService.registerNewOrganization(registerDto);
    } catch (error: any) {
      // Re-throw known exceptions
      if (error instanceof ConflictException || error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      // For any other errors, throw a generic message
      throw new BadRequestException(error.message || 'Registration failed. Please try again.');
    }
  }

  @Post('register-staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async registerStaff(@Body() registerDto: RegisterDto, @CurrentUser() user: any) {
    try {
      // Validate input (DTO validation will handle this, but double-check for safety)
      if (!registerDto.email || !registerDto.password || !registerDto.name) {
        throw new BadRequestException('Email, password, and name are required');
      }

      // Trim email to avoid whitespace issues
      registerDto.email = registerDto.email.trim().toLowerCase();

      // Set default role to STAFF if not provided
      if (!registerDto.role) {
        registerDto.role = 'STAFF';
      }

      // Organization name is not needed for staff registration (uses admin's organization)
      // Admin can register staff in their organization
      return await this.authService.register(registerDto, user);
    } catch (error: any) {
      // Re-throw known exceptions
      if (error instanceof ConflictException || error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      // For any other errors, throw a generic message
      throw new BadRequestException(error.message || 'Failed to register staff member. Please try again.');
    }
  }

  @Get('google')
  async googleAuth(@Res() res: Response) {
    // CRITICAL: Check credentials FIRST before any redirect to Google
    const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
    
    // Validate credentials - if invalid, redirect to frontend with error (NOT to Google)
    const isValid = googleClientId && 
                    googleClientSecret && 
                    googleClientId !== 'dummy-client-id' && 
                    googleClientSecret !== 'dummy-client-secret' &&
                    googleClientId.length > 0 &&
                    googleClientSecret.length > 0;
    
    if (!isValid) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=oauth_not_configured&provider=google`);
    }
    
    // Only redirect to Google if credentials are valid
    const callbackURL = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback');
    const redirectURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${callbackURL}&response_type=code&scope=email profile&access_type=offline`;
    return res.redirect(redirectURL);
  }

  @Get('google/callback')
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      // CRITICAL: Check credentials FIRST - prevent Google error page
      const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
      const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
      
      const isValid = googleClientId && 
                      googleClientSecret && 
                      googleClientId !== 'dummy-client-id' && 
                      googleClientSecret !== 'dummy-client-secret' &&
                      googleClientId.length > 0 &&
                      googleClientSecret.length > 0;
      
      if (!isValid) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/login?error=oauth_not_configured&provider=google`);
      }

      // Check for error from Google OAuth
      if (req.query.error) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
      }

      // Only process OAuth if credentials are valid
      return this.processGoogleCallback(req, res);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }

  @UseGuards(GoogleAuthGuard)
  private async processGoogleCallback(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        throw new Error('OAuth authentication failed');
      }
      
      const result = await this.authService.validateOAuthLogin(req.user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const token = encodeURIComponent(result.access_token);
      const user = encodeURIComponent(JSON.stringify(result.user));
      
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${user}`);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }

  @Get('facebook')
  async facebookAuth(@Res() res: Response) {
    // CRITICAL: Check credentials FIRST before any redirect to Facebook
    const facebookAppId = (process.env.FACEBOOK_APP_ID || '').trim();
    const facebookAppSecret = (process.env.FACEBOOK_APP_SECRET || '').trim();
    
    // Validate credentials - if invalid, redirect to frontend with error (NOT to Facebook)
    const isValid = facebookAppId && 
                    facebookAppSecret && 
                    facebookAppId !== 'dummy-app-id' && 
                    facebookAppSecret !== 'dummy-app-secret' &&
                    facebookAppId.length > 0 &&
                    facebookAppSecret.length > 0;
    
    if (!isValid) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=oauth_not_configured&provider=facebook`);
    }
    
    // Only redirect to Facebook if credentials are valid
    const callbackURL = encodeURIComponent(process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:4000/api/auth/facebook/callback');
    const redirectURL = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${callbackURL}&scope=email`;
    return res.redirect(redirectURL);
  }

  @Get('facebook/callback')
  async facebookAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      // CRITICAL: Check credentials FIRST - prevent Facebook error page
      const facebookAppId = (process.env.FACEBOOK_APP_ID || '').trim();
      const facebookAppSecret = (process.env.FACEBOOK_APP_SECRET || '').trim();
      
      const isValid = facebookAppId && 
                      facebookAppSecret && 
                      facebookAppId !== 'dummy-app-id' && 
                      facebookAppSecret !== 'dummy-app-secret' &&
                      facebookAppId.length > 0 &&
                      facebookAppSecret.length > 0;
      
      if (!isValid) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/login?error=oauth_not_configured&provider=facebook`);
      }

      // Check for error from Facebook OAuth
      if (req.query.error) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
      }

      // Only process OAuth if credentials are valid
      return this.processFacebookCallback(req, res);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }

  @UseGuards(FacebookAuthGuard)
  private async processFacebookCallback(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        throw new Error('OAuth authentication failed');
      }
      
      const result = await this.authService.validateOAuthLogin(req.user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const token = encodeURIComponent(result.access_token);
      const user = encodeURIComponent(JSON.stringify(result.user));
      
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${user}`);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }

  @Get('oauth-status')
  async getOAuthStatus() {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const facebookAppId = process.env.FACEBOOK_APP_ID;
    
    return {
      google: {
        enabled: !!googleClientId && googleClientId !== 'dummy-client-id' && googleClientId !== '',
      },
      facebook: {
        enabled: !!facebookAppId && facebookAppId !== 'dummy-app-id' && facebookAppId !== '',
      },
    };
  }
}
