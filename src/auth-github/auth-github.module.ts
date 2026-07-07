import { Module } from '@nestjs/common';
import { AuthGitHubService } from './auth-github.service';
import { ConfigModule } from '@nestjs/config';
import { AuthGitHubController } from './auth-github.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [AuthGitHubService],
  exports: [AuthGitHubService],
  controllers: [AuthGitHubController],
})
export class AuthGitHubModule {}
