import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import {
  ProjectIdea,
  ProjectIdeaInterest,
  ProjectIdeaRole,
} from '../../domain/project-idea';
import { ProjectIdeaStatus } from '../../domain/project-idea-status.enum';

export type ProjectIdeaUpdate = Partial<
  Pick<
    ProjectIdea,
    | 'title'
    | 'description'
    | 'tags'
    | 'status'
    | 'rejectionReason'
    | 'reviewerId'
    | 'reviewedAt'
  >
>;

export abstract class ProjectIdeaRepository {
  abstract create(data: {
    title: string;
    description: string;
    tags: string[];
    authorId: number;
  }): Promise<ProjectIdea>;

  abstract findById(id: ProjectIdea['id']): Promise<NullableType<ProjectIdea>>;

  /** Ideias aprovadas (com ou sem time já formado). */
  abstract findPublic(
    paginationOptions: IPaginationOptions,
  ): Promise<ProjectIdea[]>;

  abstract findByAuthorId(
    authorId: number,
    paginationOptions: IPaginationOptions,
  ): Promise<ProjectIdea[]>;

  abstract findByStatus(
    status: ProjectIdeaStatus,
    paginationOptions: IPaginationOptions,
  ): Promise<ProjectIdea[]>;

  abstract update(
    id: ProjectIdea['id'],
    payload: ProjectIdeaUpdate,
  ): Promise<ProjectIdea | null>;

  abstract remove(id: ProjectIdea['id']): Promise<void>;

  abstract upsertInterest(
    ideaId: ProjectIdea['id'],
    userId: number,
    role: string,
    message: string | null,
  ): Promise<ProjectIdeaInterest>;

  /** Sem `role`, remove a participação da pessoa em todos os cargos. */
  abstract removeInterest(
    ideaId: ProjectIdea['id'],
    userId: number,
    role?: string,
  ): Promise<void>;

  abstract findInterest(
    ideaId: ProjectIdea['id'],
    userId: number,
  ): Promise<NullableType<ProjectIdeaInterest>>;

  abstract findUserInterests(
    ideaId: ProjectIdea['id'],
    userId: number,
  ): Promise<ProjectIdeaInterest[]>;

  abstract findInterests(
    ideaId: ProjectIdea['id'],
  ): Promise<ProjectIdeaInterest[]>;

  abstract findRoles(ideaId: ProjectIdea['id']): Promise<ProjectIdeaRole[]>;

  abstract addRoles(
    ideaId: ProjectIdea['id'],
    names: string[],
  ): Promise<ProjectIdeaRole[]>;

  /** Remove o cargo e as participações nele. Retorna false se não existir. */
  abstract removeRole(
    ideaId: ProjectIdea['id'],
    roleId: ProjectIdeaRole['id'],
  ): Promise<boolean>;
}
