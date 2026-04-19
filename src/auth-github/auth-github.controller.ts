import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { AuthGitHubService } from './auth-github.service';
import { AuthGitHubLoginDto } from './dto/auth-github-login.dto';
import { LoginResponseDto } from '../auth/dto/login-response.dto';

@ApiTags('Auth')
@Controller({ path: 'auth/github', version: '1' })
export class AuthGitHubController {
  constructor(
    private readonly authService: AuthService,
    private readonly authGitHubService: AuthGitHubService,
  ) {}

  @ApiOkResponse({ type: LoginResponseDto })
  @SerializeOptions({ groups: ['me'] })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: AuthGitHubLoginDto): Promise<LoginResponseDto> {
    const socialData = await this.authGitHubService.getProfileByCode(loginDto);
    return this.authService.validateSocialLogin('github', socialData);
  }
}
