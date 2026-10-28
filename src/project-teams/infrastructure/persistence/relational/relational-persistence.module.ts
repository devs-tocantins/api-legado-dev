import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectIdeaRepository } from '../project-idea.repository';
import { ProjectTeamRepository } from '../project-team.repository';
import { ProjectIdeaEntity } from './entities/project-idea.entity';
import { ProjectIdeaInterestEntity } from './entities/project-idea-interest.entity';
import { ProjectTeamEntity } from './entities/project-team.entity';
import { ProjectTeamMemberEntity } from './entities/project-team-member.entity';
import { ProjectTeamVacancyEntity } from './entities/project-team-vacancy.entity';
import { ProjectIdeaRelationalRepository } from './repositories/project-idea.repository';
import { ProjectTeamRelationalRepository } from './repositories/project-team.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectIdeaEntity,
      ProjectIdeaInterestEntity,
      ProjectTeamEntity,
      ProjectTeamVacancyEntity,
      ProjectTeamMemberEntity,
    ]),
  ],
  providers: [
    {
      provide: ProjectIdeaRepository,
      useClass: ProjectIdeaRelationalRepository,
    },
    {
      provide: ProjectTeamRepository,
      useClass: ProjectTeamRelationalRepository,
    },
  ],
  exports: [ProjectIdeaRepository, ProjectTeamRepository],
})
export class RelationalProjectTeamsPersistenceModule {}
