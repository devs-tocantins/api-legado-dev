import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { ProjectIdea, ProjectIdeaInterest } from '../../domain/project-idea';
import { ProjectIdeaStatus } from '../../domain/project-idea-status.enum';
import { ProjectRole } from '../../domain/project-role.enum';

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
    role: ProjectRole,
    message: string | null,
  ): Promise<ProjectIdeaInterest>;

  abstract removeInterest(
    ideaId: ProjectIdea['id'],
    userId: number,
  ): Promise<void>;

  abstract findInterest(
    ideaId: ProjectIdea['id'],
    userId: number,
  ): Promise<NullableType<ProjectIdeaInterest>>;

  abstract findInterests(
    ideaId: ProjectIdea['id'],
  ): Promise<ProjectIdeaInterest[]>;
}
