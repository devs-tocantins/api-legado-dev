import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { RelationalProjectTeamsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ProjectIdeasController } from './project-ideas.controller';
import { ProjectIdeasService } from './project-ideas.service';
import { ProjectRewardsService } from './project-rewards.service';
import { ProjectTeamsController } from './project-teams.controller';
import { ProjectTeamsService } from './project-teams.service';

@Module({
  imports: [RelationalProjectTeamsPersistenceModule, NotificationsModule],
  controllers: [ProjectIdeasController, ProjectTeamsController],
  providers: [ProjectIdeasService, ProjectTeamsService, ProjectRewardsService],
  exports: [ProjectIdeasService, ProjectTeamsService],
})
export class ProjectTeamsModule {}
