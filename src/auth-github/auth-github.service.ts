import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialInterface } from '../social/interfaces/social.interface';
import { AuthGitHubLoginDto } from './dto/auth-github-login.dto';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class AuthGitHubService {
  constructor(private configService: ConfigService<AllConfigType>) {}

  async getProfileByCode(
    loginDto: AuthGitHubLoginDto,
  ): Promise<SocialInterface> {
    const clientId = this.configService.getOrThrow('github.clientId', {
      infer: true,
    });
    const clientSecret = this.configService.getOrThrow('github.clientSecret', {
      infer: true,
    });

    // Exchange code for access token
    const tokenRes = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: loginDto.code,
        }),
      },
    );

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
    };

    if (!tokenData.access_token) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { user: 'wrongToken' },
      });
    }

    // Get user profile
    const [userRes, emailsRes] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/vnd.github+json',
        },
      }),
      fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/vnd.github+json',
        },
      }),
    ]);

    const user = (await userRes.json()) as {
      id: number;
      name?: string;
      login: string;
    };

    const emails = (await emailsRes.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;

    const primaryEmail = emails.find((e) => e.primary && e.verified)?.email;

    if (!primaryEmail) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { user: 'noVerifiedEmail' },
      });
    }

    const [firstName, ...rest] = (user.name ?? user.login).split(' ');

    return {
      id: String(user.id),
      email: primaryEmail,
      firstName,
      lastName: rest.join(' ') || undefined,
    };
  }
}
