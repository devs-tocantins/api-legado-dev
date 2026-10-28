import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { ProjectRole } from '../../domain/project-role.enum';
import { ProjectTeam } from '../../domain/project-team';
import { ProjectTeamStatus } from '../../domain/project-team-status.enum';

export type ProjectTeamVacancyInput = { role: ProjectRole; quantity: number };
export type ProjectTeamMemberInput = { userId: number; role: ProjectRole };

export type ProjectTeamUpdate = Partial<
  Pick<ProjectTeam, 'name' | 'description' | 'status' | 'repoUrl'>
>;

export abstract class ProjectTeamRepository {
  /**
   * Cria o time com vagas e membros iniciais e marca a ideia de origem como
   * TEAM_FORMED, tudo na mesma transação.
   */
  abstract create(data: {
    ideaId: string;
    name: string;
    description: string | null;
    repoUrl: string | null;
    ownerId: number;
    vacancies: ProjectTeamVacancyInput[];
    members: ProjectTeamMemberInput[];
  }): Promise<ProjectTeam>;

  abstract findById(id: ProjectTeam['id']): Promise<NullableType<ProjectTeam>>;

  abstract findByIdeaId(ideaId: string): Promise<NullableType<ProjectTeam>>;

  abstract findPublic(
    paginationOptions: IPaginationOptions,
    status?: ProjectTeamStatus,
  ): Promise<ProjectTeam[]>;

  /** Times em que o usuário é dono ou membro. */
  abstract findByUserId(
    userId: number,
    paginationOptions: IPaginationOptions,
  ): Promise<ProjectTeam[]>;

  abstract update(
    id: ProjectTeam['id'],
    payload: ProjectTeamUpdate,
  ): Promise<ProjectTeam | null>;

  abstract replaceVacancies(
    id: ProjectTeam['id'],
    vacancies: ProjectTeamVacancyInput[],
  ): Promise<void>;

  abstract addMember(
    id: ProjectTeam['id'],
    member: ProjectTeamMemberInput,
  ): Promise<void>;

  abstract removeMember(id: ProjectTeam['id'], userId: number): Promise<void>;
}
