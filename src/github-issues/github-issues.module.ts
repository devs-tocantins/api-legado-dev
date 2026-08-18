import { Module } from '@nestjs/common';
import { GithubIssuesService } from './github-issues.service';

@Module({
  providers: [GithubIssuesService],
  exports: [GithubIssuesService],
})
export class GithubIssuesModule {}
