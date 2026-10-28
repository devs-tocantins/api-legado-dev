import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { NotificationType } from '../notifications/domain/notification-type.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { ProjectIdeaStatus } from './domain/project-idea-status.enum';
import { ProjectRole } from './domain/project-role.enum';
import { ProjectTeam } from './domain/project-team';
import { ProjectTeamStatus } from './domain/project-team-status.enum';
import { AddProjectTeamMemberDto } from './dto/add-project-team-member.dto';
import { CreateProjectTeamDto } from './dto/create-project-team.dto';
import { UpdateProjectTeamDto } from './dto/update-project-team.dto';
import { ProjectIdeaRepository } from './infrastructure/persistence/project-idea.repository';
import {
  ProjectTeamMemberInput,
  ProjectTeamRepository,
  ProjectTeamVacancyInput,
} from './infrastructure/persistence/project-team.repository';

const CLOSED_STATUSES = [
  ProjectTeamStatus.COMPLETED,
  ProjectTeamStatus.CANCELLED,
];

function unprocessable(field: string, message: string) {
  return new UnprocessableEntityException({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    errors: { [field]: message },
  });
}

@Injectable()
export class ProjectTeamsService {
  constructor(
    private readonly teamRepository: ProjectTeamRepository,
    private readonly ideaRepository: ProjectIdeaRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async getOrFail(id: ProjectTeam['id']): Promise<ProjectTeam> {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new NotFoundException('Time não encontrado.');
    }
    return team;
  }

  private assertOwnerOrAdmin(
    team: ProjectTeam,
    userId: number,
    canManageAny: boolean,
    message: string,
  ) {
    if (team.ownerId !== userId && !canManageAny) {
      throw new ForbiddenException(message);
    }
  }

  private assertUniqueRoles(vacancies: ProjectTeamVacancyInput[]) {
    const roles = vacancies.map((vacancy) => vacancy.role);
    if (new Set(roles).size !== roles.length) {
      throw unprocessable('vacancies', 'Cada cargo só pode aparecer uma vez.');
    }
  }

  /** Garante que há vaga livre no cargo para mais uma pessoa. */
  private assertHasOpenVacancy(
    vacancies: ProjectTeamVacancyInput[],
    members: ProjectTeamMemberInput[],
    role: ProjectRole,
  ) {
    const vacancy = vacancies.find((v) => v.role === role);
    if (!vacancy) {
      throw unprocessable('role', 'O time não tem vagas para este cargo.');
    }
    const filled = members.filter((m) => m.role === role).length;
    if (filled >= vacancy.quantity) {
      throw unprocessable(
        'role',
        'Todas as vagas deste cargo já foram preenchidas.',
      );
    }
  }

  private async assertInterested(ideaId: string, userId: number) {
    const interest = await this.ideaRepository.findInterest(ideaId, userId);
    if (!interest) {
      throw unprocessable(
        'userId',
        'Só é possível adicionar quem demonstrou interesse na ideia.',
      );
    }
  }

  private async notifyAdded(
    team: ProjectTeam,
    members: ProjectTeamMemberInput[],
  ) {
    await Promise.allSettled(
      members.map((member) =>
        this.notificationsService.create({
          userId: member.userId,
          type: NotificationType.PROJECT_TEAM_MEMBER_ADDED,
          title: `Você entrou no time: ${team.name}`,
          body: `Projeto "${team.ideaTitle}".`,
          relatedId: team.id,
          link: `/projetos/times/${team.id}`,
          payload: { teamId: team.id },
        }),
      ),
    );
  }

  async create(
    dto: CreateProjectTeamDto,
    userId: number,
  ): Promise<ProjectTeam> {
    const idea = await this.ideaRepository.findById(dto.ideaId);
    if (!idea) {
      throw new NotFoundException('Ideia não encontrada.');
    }
    if (idea.authorId !== userId) {
      throw new ForbiddenException(
        'Apenas o autor da ideia pode montar o time.',
      );
    }
    if (idea.status === ProjectIdeaStatus.TEAM_FORMED) {
      throw unprocessable('ideaId', 'Esta ideia já tem um time formado.');
    }
    if (idea.status !== ProjectIdeaStatus.APPROVED) {
      throw unprocessable(
        'ideaId',
        'A ideia precisa estar aprovada para montar um time.',
      );
    }

    const vacancies = dto.vacancies.map(({ role, quantity }) => ({
      role,
      quantity,
    }));
    this.assertUniqueRoles(vacancies);

    const members: ProjectTeamMemberInput[] = [];
    for (const member of dto.members ?? []) {
      if (member.userId === userId) {
        throw unprocessable('members', 'O autor já é o dono do time.');
      }
      if (members.some((m) => m.userId === member.userId)) {
        throw unprocessable('members', 'Pessoa repetida na lista de membros.');
      }
      await this.assertInterested(idea.id, member.userId);
      this.assertHasOpenVacancy(vacancies, members, member.role);
      members.push({ userId: member.userId, role: member.role });
    }

    const team = await this.teamRepository.create({
      ideaId: idea.id,
      name: dto.name,
      description: dto.description?.trim() || null,
      repoUrl: dto.repoUrl ?? null,
      ownerId: userId,
      vacancies,
      members,
    });
    await this.notifyAdded(team, members);
    return team;
  }

  findPublic(
    paginationOptions: IPaginationOptions,
    status?: ProjectTeamStatus,
  ) {
    return this.teamRepository.findPublic(paginationOptions, status);
  }

  findMine(userId: number, paginationOptions: IPaginationOptions) {
    return this.teamRepository.findByUserId(userId, paginationOptions);
  }

  findById(id: ProjectTeam['id']) {
    return this.getOrFail(id);
  }

  async update(
    id: ProjectTeam['id'],
    dto: UpdateProjectTeamDto,
    userId: number,
    canManageAny: boolean,
  ) {
    const team = await this.getOrFail(id);
    this.assertOwnerOrAdmin(
      team,
      userId,
      canManageAny,
      'Você não tem permissão para editar este time.',
    );

    if (dto.vacancies) {
      const vacancies = dto.vacancies.map(({ role, quantity }) => ({
        role,
        quantity,
      }));
      this.assertUniqueRoles(vacancies);
      for (const role of new Set(team.members.map((m) => m.role))) {
        const filled = team.members.filter((m) => m.role === role).length;
        const vacancy = vacancies.find((v) => v.role === role);
        if (!vacancy || vacancy.quantity < filled) {
          throw unprocessable(
            'vacancies',
            'Não é possível reduzir as vagas abaixo do número de membros do cargo.',
          );
        }
      }
      await this.teamRepository.replaceVacancies(id, vacancies);
    }

    return this.teamRepository.update(id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && {
        description: dto.description?.trim() || null,
      }),
      ...(dto.repoUrl !== undefined && { repoUrl: dto.repoUrl }),
      ...(dto.status !== undefined && { status: dto.status }),
    });
  }

  async addMember(
    id: ProjectTeam['id'],
    dto: AddProjectTeamMemberDto,
    userId: number,
    canManageAny: boolean,
  ) {
    const team = await this.getOrFail(id);
    this.assertOwnerOrAdmin(
      team,
      userId,
      canManageAny,
      'Apenas o dono do time pode adicionar membros.',
    );
    if (CLOSED_STATUSES.includes(team.status)) {
      throw unprocessable('status', 'Este time não está mais montando equipe.');
    }
    if (dto.userId === team.ownerId) {
      throw unprocessable('userId', 'O dono já faz parte do time.');
    }
    if (team.members.some((m) => m.userId === dto.userId)) {
      throw unprocessable('userId', 'Esta pessoa já está no time.');
    }
    await this.assertInterested(team.ideaId, dto.userId);
    this.assertHasOpenVacancy(
      team.vacancies,
      team.members.map((m) => ({ userId: m.userId, role: m.role })),
      dto.role,
    );

    await this.teamRepository.addMember(id, {
      userId: dto.userId,
      role: dto.role,
    });
    await this.notifyAdded(team, [{ userId: dto.userId, role: dto.role }]);
    return this.getOrFail(id);
  }

  async removeMember(
    id: ProjectTeam['id'],
    memberUserId: number,
    actorId: number,
    canManageAny: boolean,
  ) {
    const team = await this.getOrFail(id);
    if (memberUserId !== actorId && team.ownerId !== actorId && !canManageAny) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este membro.',
      );
    }
    if (!team.members.some((m) => m.userId === memberUserId)) {
      throw new NotFoundException('Membro não encontrado neste time.');
    }
    await this.teamRepository.removeMember(id, memberUserId);
  }
}
