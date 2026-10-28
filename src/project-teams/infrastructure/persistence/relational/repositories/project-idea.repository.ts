import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import {
  ProjectIdea,
  ProjectIdeaInterest,
  ProjectIdeaRole,
} from '../../../../domain/project-idea';
import { ProjectIdeaStatus } from '../../../../domain/project-idea-status.enum';
import {
  ProjectIdeaRepository,
  ProjectIdeaUpdate,
} from '../../project-idea.repository';
import { GamificationProfileEntity } from '../../../../../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { ProjectIdeaEntity } from '../entities/project-idea.entity';
import { ProjectIdeaRoleEntity } from '../entities/project-idea-role.entity';
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
    @InjectRepository(ProjectIdeaRoleEntity)
    private readonly roleRepository: Repository<ProjectIdeaRoleEntity>,
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
      .addSelect('COUNT(DISTINCT interest.userId)', 'count')
      .where('interest.ideaId IN (:...ids)', { ids })
      .groupBy('interest.ideaId')
      .getRawMany<{ ideaId: string; count: string }>();
    const countByIdea = new Map(counts.map((c) => [c.ideaId, Number(c.count)]));

    const teams = await this.teamRepository.find({
      where: { ideaId: In(ids) },
      select: { id: true, ideaId: true },
    });
    const teamByIdea = new Map(teams.map((t) => [t.ideaId, t.id]));

    const authorIds = [...new Set(entities.map((entity) => entity.authorId))];
    const profiles = await this.interestRepository.manager
      .getRepository(GamificationProfileEntity)
      .find({
        where: { userId: In(authorIds) },
        select: { userId: true, username: true },
      });
    const usernameByUser = new Map(
      profiles.map((profile) => [profile.userId, profile.username]),
    );

    return entities.map((entity) => {
      const idea = ProjectMapper.ideaToDomain(entity, {
        interestCount: countByIdea.get(entity.id) ?? 0,
        teamId: teamByIdea.get(entity.id) ?? null,
      });
      if (idea.author) {
        idea.author.username = usernameByUser.get(entity.authorId) ?? null;
      }
      return idea;
    });
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
    role: string,
    message: string | null,
  ): Promise<ProjectIdeaInterest> {
    const existing = await this.interestRepository.findOne({
      where: { ideaId, userId, role },
    });
    const saved = await this.interestRepository.save(
      existing
        ? Object.assign(existing, { role, message })
        : this.interestRepository.create({ ideaId, userId, role, message }),
    );
    return ProjectMapper.interestToDomain(saved);
  }

  async removeInterest(
    ideaId: ProjectIdea['id'],
    userId: number,
    role?: string,
  ) {
    await this.interestRepository.delete(
      role ? { ideaId, userId, role } : { ideaId, userId },
    );
  }

  async findUserInterests(
    ideaId: ProjectIdea['id'],
    userId: number,
  ): Promise<ProjectIdeaInterest[]> {
    const entities = await this.interestRepository.find({
      where: { ideaId, userId },
      order: { createdAt: 'ASC' },
    });
    return entities.map((entity) => ProjectMapper.interestToDomain(entity));
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
    const interests = entities.map((entity) =>
      ProjectMapper.interestToDomain(entity),
    );

    const userIds = [...new Set(interests.map((interest) => interest.userId))];
    if (userIds.length > 0) {
      const profiles = await this.interestRepository.manager
        .getRepository(GamificationProfileEntity)
        .find({
          where: { userId: In(userIds) },
          select: { userId: true, username: true },
        });
      const usernameByUser = new Map(
        profiles.map((profile) => [profile.userId, profile.username]),
      );
      for (const interest of interests) {
        if (interest.user) {
          interest.user.username = usernameByUser.get(interest.userId) ?? null;
        }
      }
    }
    return interests;
  }

  async findRoles(ideaId: ProjectIdea['id']): Promise<ProjectIdeaRole[]> {
    const entities = await this.roleRepository.find({
      where: { ideaId },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
    return entities.map((entity) => ProjectMapper.ideaRoleToDomain(entity));
  }

  async addRoles(
    ideaId: ProjectIdea['id'],
    names: string[],
  ): Promise<ProjectIdeaRole[]> {
    const last = await this.roleRepository.find({
      where: { ideaId },
      order: { position: 'DESC' },
      take: 1,
    });
    let position = (last[0]?.position ?? -1) + 1;
    const saved = await this.roleRepository.save(
      names.map((name) =>
        this.roleRepository.create({ ideaId, name, position: position++ }),
      ),
    );
    return saved.map((entity) => ProjectMapper.ideaRoleToDomain(entity));
  }

  async removeRole(
    ideaId: ProjectIdea['id'],
    roleId: ProjectIdeaRole['id'],
  ): Promise<boolean> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId, ideaId },
    });
    if (!role) {
      return false;
    }
    await this.interestRepository.delete({ ideaId, role: role.name });
    await this.roleRepository.delete({ id: role.id });
    return true;
  }
}
