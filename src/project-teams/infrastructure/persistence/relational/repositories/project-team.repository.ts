import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { ProjectIdeaStatus } from '../../../../domain/project-idea-status.enum';
import { ProjectTeam } from '../../../../domain/project-team';
import { ProjectTeamStatus } from '../../../../domain/project-team-status.enum';
import {
  ProjectTeamMemberInput,
  ProjectTeamRepository,
  ProjectTeamUpdate,
  ProjectTeamVacancyInput,
} from '../../project-team.repository';
import { ProjectIdeaEntity } from '../entities/project-idea.entity';
import { ProjectTeamEntity } from '../entities/project-team.entity';
import { ProjectTeamMemberEntity } from '../entities/project-team-member.entity';
import { ProjectTeamVacancyEntity } from '../entities/project-team-vacancy.entity';
import { ProjectMapper } from '../mappers/project.mapper';

const TEAM_RELATIONS = {
  idea: true,
  owner: { photo: true },
  vacancies: true,
  members: { user: { photo: true } },
};

@Injectable()
export class ProjectTeamRelationalRepository implements ProjectTeamRepository {
  constructor(
    @InjectRepository(ProjectTeamEntity)
    private readonly teamRepository: Repository<ProjectTeamEntity>,
    @InjectRepository(ProjectTeamVacancyEntity)
    private readonly vacancyRepository: Repository<ProjectTeamVacancyEntity>,
    @InjectRepository(ProjectTeamMemberEntity)
    private readonly memberRepository: Repository<ProjectTeamMemberEntity>,
  ) {}

  async create(data: {
    ideaId: string;
    name: string;
    description: string | null;
    repoUrl: string | null;
    ownerId: number;
    vacancies: ProjectTeamVacancyInput[];
    members: ProjectTeamMemberInput[];
  }): Promise<ProjectTeam> {
    const teamId = await this.teamRepository.manager.transaction(
      async (manager) => {
        const team = await manager.save(
          manager.create(ProjectTeamEntity, {
            ideaId: data.ideaId,
            name: data.name,
            description: data.description,
            repoUrl: data.repoUrl,
            ownerId: data.ownerId,
            status: ProjectTeamStatus.RECRUITING,
          }),
        );
        await manager.save(
          data.vacancies.map((vacancy) =>
            manager.create(ProjectTeamVacancyEntity, {
              teamId: team.id,
              ...vacancy,
            }),
          ),
        );
        if (data.members.length > 0) {
          await manager.save(
            data.members.map((member) =>
              manager.create(ProjectTeamMemberEntity, {
                teamId: team.id,
                ...member,
              }),
            ),
          );
        }
        await manager.update(ProjectIdeaEntity, data.ideaId, {
          status: ProjectIdeaStatus.TEAM_FORMED,
        });
        return team.id;
      },
    );
    return (await this.findById(teamId)) as ProjectTeam;
  }

  async findById(id: ProjectTeam['id']): Promise<NullableType<ProjectTeam>> {
    const entity = await this.teamRepository.findOne({
      where: { id },
      relations: TEAM_RELATIONS,
    });
    return entity ? ProjectMapper.teamToDomain(entity) : null;
  }

  async findByIdeaId(ideaId: string): Promise<NullableType<ProjectTeam>> {
    const entity = await this.teamRepository.findOne({
      where: { ideaId },
      relations: TEAM_RELATIONS,
    });
    return entity ? ProjectMapper.teamToDomain(entity) : null;
  }

  private async loadInOrder(ids: string[]): Promise<ProjectTeam[]> {
    if (ids.length === 0) {
      return [];
    }
    const entities = await this.teamRepository.find({
      where: { id: In(ids) },
      relations: TEAM_RELATIONS,
    });
    const byId = new Map(entities.map((entity) => [entity.id, entity]));
    return ids
      .map((id) => byId.get(id))
      .filter((entity): entity is ProjectTeamEntity => !!entity)
      .map((entity) => ProjectMapper.teamToDomain(entity));
  }

  async findPublic(
    paginationOptions: IPaginationOptions,
    status?: ProjectTeamStatus,
  ): Promise<ProjectTeam[]> {
    const rows = await this.teamRepository.find({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
      select: { id: true },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
    return this.loadInOrder(rows.map((row) => row.id));
  }

  async findByUserId(
    userId: number,
    paginationOptions: IPaginationOptions,
  ): Promise<ProjectTeam[]> {
    // Filtro feito numa query separada: um `where` em `members` no find
    // principal descartaria os demais membros do resultado carregado.
    const rows = await this.teamRepository
      .createQueryBuilder('team')
      .leftJoin('team.members', 'member')
      .where('team.ownerId = :userId OR member.userId = :userId', { userId })
      .select(['team.id', 'team.createdAt'])
      .orderBy('team.createdAt', 'DESC')
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .getMany();
    return this.loadInOrder(rows.map((row) => row.id));
  }

  async update(
    id: ProjectTeam['id'],
    payload: ProjectTeamUpdate,
  ): Promise<ProjectTeam | null> {
    if (Object.keys(payload).length > 0) {
      await this.teamRepository.update(id, payload);
    }
    return this.findById(id);
  }

  async replaceVacancies(
    id: ProjectTeam['id'],
    vacancies: ProjectTeamVacancyInput[],
  ): Promise<void> {
    await this.vacancyRepository.manager.transaction(async (manager) => {
      await manager.delete(ProjectTeamVacancyEntity, { teamId: id });
      await manager.save(
        vacancies.map((vacancy) =>
          manager.create(ProjectTeamVacancyEntity, { teamId: id, ...vacancy }),
        ),
      );
    });
  }

  async addMember(
    id: ProjectTeam['id'],
    member: ProjectTeamMemberInput,
  ): Promise<void> {
    await this.memberRepository.save(
      this.memberRepository.create({ teamId: id, ...member }),
    );
  }

  async removeMember(id: ProjectTeam['id'], userId: number): Promise<void> {
    await this.memberRepository.delete({ teamId: id, userId });
  }
}
