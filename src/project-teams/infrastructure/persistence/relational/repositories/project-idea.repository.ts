import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import {
  ProjectIdea,
  ProjectIdeaInterest,
} from '../../../../domain/project-idea';
import { ProjectIdeaStatus } from '../../../../domain/project-idea-status.enum';
import { ProjectRole } from '../../../../domain/project-role.enum';
import {
  ProjectIdeaRepository,
  ProjectIdeaUpdate,
} from '../../project-idea.repository';
import { ProjectIdeaEntity } from '../entities/project-idea.entity';
import { ProjectIdeaInterestEntity } from '../entities/project-idea-interest.entity';
import { ProjectTeamEntity } from '../entities/project-team.entity';
import { ProjectMapper } from '../mappers/project.mapper';

const IDEA_RELATIONS = { author: { photo: true } };

@Injectable()
export class ProjectIdeaRelationalRepository implements ProjectIdeaRepository {
  constructor(
    @InjectRepository(ProjectIdeaEntity)
    private readonly ideaRepository: Repository<ProjectIdeaEntity>,
    @InjectRepository(ProjectIdeaInterestEntity)
    private readonly interestRepository: Repository<ProjectIdeaInterestEntity>,
    @InjectRepository(ProjectTeamEntity)
    private readonly teamRepository: Repository<ProjectTeamEntity>,
  ) {}

  /** Anexa contagem de interessados e id do time a cada ideia. */
  private async enrich(entities: ProjectIdeaEntity[]): Promise<ProjectIdea[]> {
    if (entities.length === 0) {
      return [];
    }
    const ids = entities.map((entity) => entity.id);

    const counts = await this.interestRepository
      .createQueryBuilder('interest')
      .select('interest.ideaId', 'ideaId')
      .addSelect('COUNT(*)', 'count')
      .where('interest.ideaId IN (:...ids)', { ids })
      .groupBy('interest.ideaId')
      .getRawMany<{ ideaId: string; count: string }>();
    const countByIdea = new Map(counts.map((c) => [c.ideaId, Number(c.count)]));

    const teams = await this.teamRepository.find({
      where: { ideaId: In(ids) },
      select: { id: true, ideaId: true },
    });
    const teamByIdea = new Map(teams.map((t) => [t.ideaId, t.id]));

    return entities.map((entity) =>
      ProjectMapper.ideaToDomain(entity, {
        interestCount: countByIdea.get(entity.id) ?? 0,
        teamId: teamByIdea.get(entity.id) ?? null,
      }),
    );
  }

  private async findList(
    where: Record<string, unknown>,
    order: Record<string, 'ASC' | 'DESC'>,
    paginationOptions: IPaginationOptions,
  ): Promise<ProjectIdea[]> {
    const entities = await this.ideaRepository.find({
      where,
      order,
      relations: IDEA_RELATIONS,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
    return this.enrich(entities);
  }

  async create(data: {
    title: string;
    description: string;
    tags: string[];
    authorId: number;
  }): Promise<ProjectIdea> {
    const saved = await this.ideaRepository.save(
      this.ideaRepository.create({
        ...data,
        status: ProjectIdeaStatus.PENDING,
      }),
    );
    return (await this.findById(saved.id)) as ProjectIdea;
  }

  async findById(id: ProjectIdea['id']): Promise<NullableType<ProjectIdea>> {
    const entity = await this.ideaRepository.findOne({
      where: { id },
      relations: IDEA_RELATIONS,
    });
    if (!entity) {
      return null;
    }
    const [idea] = await this.enrich([entity]);
    return idea;
  }

  findPublic(paginationOptions: IPaginationOptions): Promise<ProjectIdea[]> {
    return this.findList(
      {
        status: In([ProjectIdeaStatus.APPROVED, ProjectIdeaStatus.TEAM_FORMED]),
      },
      { createdAt: 'DESC' },
      paginationOptions,
    );
  }

  findByAuthorId(
    authorId: number,
    paginationOptions: IPaginationOptions,
  ): Promise<ProjectIdea[]> {
    return this.findList(
      { authorId },
      { createdAt: 'DESC' },
      paginationOptions,
    );
  }

  findByStatus(
    status: ProjectIdeaStatus,
    paginationOptions: IPaginationOptions,
  ): Promise<ProjectIdea[]> {
    return this.findList({ status }, { createdAt: 'ASC' }, paginationOptions);
  }

  async update(
    id: ProjectIdea['id'],
    payload: ProjectIdeaUpdate,
  ): Promise<ProjectIdea | null> {
    await this.ideaRepository.update(id, payload);
    return this.findById(id);
  }

  async remove(id: ProjectIdea['id']): Promise<void> {
    await this.ideaRepository.delete(id);
  }

  async upsertInterest(
    ideaId: ProjectIdea['id'],
    userId: number,
    role: ProjectRole,
    message: string | null,
  ): Promise<ProjectIdeaInterest> {
    const existing = await this.interestRepository.findOne({
      where: { ideaId, userId },
    });
    const saved = await this.interestRepository.save(
      existing
        ? Object.assign(existing, { role, message })
        : this.interestRepository.create({ ideaId, userId, role, message }),
    );
    return ProjectMapper.interestToDomain(saved);
  }

  async removeInterest(ideaId: ProjectIdea['id'], userId: number) {
    await this.interestRepository.delete({ ideaId, userId });
  }

  async findInterest(
    ideaId: ProjectIdea['id'],
    userId: number,
  ): Promise<NullableType<ProjectIdeaInterest>> {
    const entity = await this.interestRepository.findOne({
      where: { ideaId, userId },
    });
    return entity ? ProjectMapper.interestToDomain(entity) : null;
  }

  async findInterests(
    ideaId: ProjectIdea['id'],
  ): Promise<ProjectIdeaInterest[]> {
    const entities = await this.interestRepository.find({
      where: { ideaId },
      relations: { user: { photo: true } },
      order: { createdAt: 'ASC' },
    });
    return entities.map((entity) => ProjectMapper.interestToDomain(entity));
  }
}
