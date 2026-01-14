import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private configService: ConfigService,
  ) {
    // Always initialize, but use dummy values if not configured
    // The guard will prevent usage if credentials are invalid
    const appID = configService.get<string>('FACEBOOK_APP_ID') || 'dummy-app-id';
    const appSecret = configService.get<string>('FACEBOOK_APP_SECRET') || 'dummy-app-secret';
    
    super({
      clientID: appID,
      clientSecret: appSecret,
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') || 'http://localhost:4000/api/auth/facebook/callback',
      scope: 'email',
      profileFields: ['emails', 'name', 'picture'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails?.[0].value || '',
      name: `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
      picture: photos?.[0].value || '',
      provider: 'facebook',
      accessToken,
    };
    done(null, user);
  }
}
