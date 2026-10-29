import { FileMapper } from '../../../../../files/infrastructure/persistence/relational/mappers/file.mapper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import {
  ProjectIdea,
  ProjectIdeaInterest,
  ProjectIdeaRole,
} from '../../../../domain/project-idea';
import {
  ProjectTeam,
  ProjectTeamMember,
  ProjectTeamVacancy,
} from '../../../../domain/project-team';
import { ProjectUserSummary } from '../../../../domain/project-user-summary';
import { ProjectIdeaEntity } from '../entities/project-idea.entity';
import { ProjectIdeaRoleEntity } from '../entities/project-idea-role.entity';
import { ProjectIdeaInterestEntity } from '../entities/project-idea-interest.entity';
import { ProjectTeamEntity } from '../entities/project-team.entity';

export class ProjectMapper {
  static userSummary(raw?: UserEntity | null): ProjectUserSummary | null {
    if (!raw) {
      return null;
    }
    const summary = new ProjectUserSummary();
    summary.id = raw.id as number;
    summary.firstName = raw.firstName ?? null;
    summary.lastName = raw.lastName ?? null;
    summary.photo = raw.photo ? FileMapper.toDomain(raw.photo) : null;
    return summary;
  }

  static ideaToDomain(
    raw: ProjectIdeaEntity,
    extras: { interestCount: number; teamId: string | null },
  ): ProjectIdea {
    const idea = new ProjectIdea();
    idea.id = raw.id;
    idea.title = raw.title;
    idea.description = raw.description;
    idea.tags = raw.tags ?? [];
    idea.status = raw.status;
    idea.rejectionReason = raw.rejectionReason;
    idea.authorId = raw.authorId;
    idea.author = ProjectMapper.userSummary(raw.author);
    idea.reviewerId = raw.reviewerId;
    idea.reviewedAt = raw.reviewedAt;
    idea.featuredAt = raw.featuredAt ?? null;
    idea.calledAt = raw.calledAt ?? null;
    idea.interestCount = extras.interestCount;
    idea.teamId = extras.teamId;
    idea.createdAt = raw.createdAt;
    idea.updatedAt = raw.updatedAt;
    return idea;
  }

  static ideaRoleToDomain(raw: ProjectIdeaRoleEntity): ProjectIdeaRole {
    const role = new ProjectIdeaRole();
    role.id = raw.id;
    role.ideaId = raw.ideaId;
    role.name = raw.name;
    role.position = raw.position;
    return role;
  }

  static interestToDomain(raw: ProjectIdeaInterestEntity): ProjectIdeaInterest {
    const interest = new ProjectIdeaInterest();
    interest.id = raw.id;
    interest.ideaId = raw.ideaId;
    interest.userId = raw.userId;
    interest.user = ProjectMapper.userSummary(raw.user);
    interest.role = raw.role;
    interest.message = raw.message;
    interest.createdAt = raw.createdAt;
    return interest;
  }

  static teamToDomain(raw: ProjectTeamEntity): ProjectTeam {
    const members = (raw.members ?? [])
      .map((m) => {
        const member = new ProjectTeamMember();
        member.id = m.id;
        member.userId = m.userId;
        member.user = ProjectMapper.userSummary(m.user);
        member.role = m.role;
        member.createdAt = m.createdAt;
        return member;
      })
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const vacancies = (raw.vacancies ?? []).map((v) => {
      const vacancy = new ProjectTeamVacancy();
      vacancy.role = v.role;
      vacancy.quantity = v.quantity;
      vacancy.filled = members.filter((m) => m.role === v.role).length;
      return vacancy;
    });

    const team = new ProjectTeam();
    team.id = raw.id;
    team.ideaId = raw.ideaId;
    team.ideaTitle = raw.idea?.title ?? raw.name;
    team.name = raw.name;
    team.description = raw.description;
    team.status = raw.status;
    team.repoUrl = raw.repoUrl;
    team.ownerId = raw.ownerId;
    team.owner = ProjectMapper.userSummary(raw.owner);
    team.vacancies = vacancies;
    team.members = members;
    team.createdAt = raw.createdAt;
    team.updatedAt = raw.updatedAt;
    return team;
  }
}
