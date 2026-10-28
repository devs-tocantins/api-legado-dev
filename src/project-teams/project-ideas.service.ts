import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { NotificationType } from '../notifications/domain/notification-type.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { IPaginationOptions } from '../utils/types/pagination-options';
import {
  ProjectIdea,
  SuggestedVacancy,
  ProjectIdeaRole,
} from './domain/project-idea';
import { ProjectIdeaStatus } from './domain/project-idea-status.enum';
import { PROJECT_ROLE_LABELS, ProjectRole } from './domain/project-role.enum';
import { CreateProjectIdeaRoleDto } from './dto/create-project-idea-role.dto';
import { CreateProjectIdeaDto } from './dto/create-project-idea.dto';
import { ReviewProjectIdeaDto } from './dto/review-project-idea.dto';
import { SetProjectInterestDto } from './dto/set-project-interest.dto';
import { UpdateProjectIdeaDto } from './dto/update-project-idea.dto';
import { ProjectIdeaRepository } from './infrastructure/persistence/project-idea.repository';
import { suggestVacancies } from './vacancy-suggestions';

const PUBLIC_STATUSES = [
  ProjectIdeaStatus.APPROVED,
  ProjectIdeaStatus.TEAM_FORMED,
];

/** Interesse geral no projeto, sem escolher um cargo. */
const DEFAULT_INTEREST_ROLE = 'Interessado';

@Injectable()
export class ProjectIdeasService {
  constructor(
    private readonly ideaRepository: ProjectIdeaRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async getOrFail(id: ProjectIdea['id']): Promise<ProjectIdea> {
    const idea = await this.ideaRepository.findById(id);
    if (!idea) {
      throw new NotFoundException('Ideia não encontrada.');
    }
    return idea;
  }

  private assertAuthorOrAdmin(
    idea: ProjectIdea,
    userId: number,
    canManageAny: boolean,
    message: string,
  ) {
    if (idea.authorId !== userId && !canManageAny) {
      throw new ForbiddenException(message);
    }
  }

  create(dto: CreateProjectIdeaDto, authorId: number) {
    return this.ideaRepository.create({
      title: dto.title,
      description: dto.description,
      tags: dto.tags ?? [],
      authorId,
    });
  }

  findPublic(paginationOptions: IPaginationOptions) {
    return this.ideaRepository.findPublic(paginationOptions);
  }

  findMine(authorId: number, paginationOptions: IPaginationOptions) {
    return this.ideaRepository.findByAuthorId(authorId, paginationOptions);
  }

  findPending(paginationOptions: IPaginationOptions) {
    return this.ideaRepository.findByStatus(
      ProjectIdeaStatus.PENDING,
      paginationOptions,
    );
  }

  async findPublicDetail(id: ProjectIdea['id']): Promise<ProjectIdea> {
    const idea = await this.getOrFail(id);
    if (!PUBLIC_STATUSES.includes(idea.status)) {
      throw new NotFoundException('Ideia não encontrada.');
    }
    return idea;
  }

  async findForManagement(
    id: ProjectIdea['id'],
    userId: number,
    canManageAny: boolean,
  ): Promise<ProjectIdea> {
    const idea = await this.getOrFail(id);
    this.assertAuthorOrAdmin(
      idea,
      userId,
      canManageAny,
      'Você não tem permissão para visualizar esta ideia.',
    );
    return idea;
  }

  async update(
    id: ProjectIdea['id'],
    dto: UpdateProjectIdeaDto,
    userId: number,
    canManageAny: boolean,
  ) {
    const idea = await this.getOrFail(id);
    this.assertAuthorOrAdmin(
      idea,
      userId,
      canManageAny,
      'Você não tem permissão para editar esta ideia.',
    );
    if (
      !canManageAny &&
      idea.status !== ProjectIdeaStatus.PENDING &&
      idea.status !== ProjectIdeaStatus.REJECTED
    ) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Só é possível editar ideias pendentes ou rejeitadas.',
        },
      });
    }

    return this.ideaRepository.update(id, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      // Autor que corrige uma ideia rejeitada reenvia para nova revisão.
      ...(!canManageAny &&
        idea.status === ProjectIdeaStatus.REJECTED && {
          status: ProjectIdeaStatus.PENDING,
          rejectionReason: null,
          reviewerId: null,
          reviewedAt: null,
        }),
    });
  }

  async review(
    id: ProjectIdea['id'],
    dto: ReviewProjectIdeaDto,
    reviewerId: number,
  ) {
    const idea = await this.getOrFail(id);
    if (idea.status !== ProjectIdeaStatus.PENDING) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { status: 'Apenas ideias pendentes podem ser revisadas.' },
      });
    }
    const rejecting = dto.status === ProjectIdeaStatus.REJECTED;
    if (rejecting && !dto.rejectionReason?.trim()) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          rejectionReason: 'Informe o motivo da rejeição.',
        },
      });
    }

    const updated = await this.ideaRepository.update(id, {
      status: dto.status,
      rejectionReason: rejecting ? dto.rejectionReason!.trim() : null,
      reviewerId,
      reviewedAt: new Date(),
    });

    await this.notificationsService
      .create({
        userId: idea.authorId,
        type: rejecting
          ? NotificationType.PROJECT_IDEA_REJECTED
          : NotificationType.PROJECT_IDEA_APPROVED,
        title: rejecting
          ? `Ideia rejeitada: ${idea.title}`
          : `Ideia aprovada: ${idea.title}`,
        body: rejecting
          ? `Motivo: ${dto.rejectionReason!.trim()}`
          : 'Sua ideia já está visível. Acompanhe os interessados e monte o time!',
        relatedId: idea.id,
        link: `/projetos/${idea.id}`,
        payload: { ideaId: idea.id },
      })
      .catch(() => undefined);

    return updated;
  }

  async remove(id: ProjectIdea['id'], userId: number, canManageAny: boolean) {
    const idea = await this.getOrFail(id);
    this.assertAuthorOrAdmin(
      idea,
      userId,
      canManageAny,
      'Você não tem permissão para excluir esta ideia.',
    );
    if (idea.status === ProjectIdeaStatus.TEAM_FORMED && !canManageAny) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Ideias com time formado não podem ser excluídas.',
        },
      });
    }
    await this.ideaRepository.remove(id);
  }

  async setInterest(
    id: ProjectIdea['id'],
    userId: number,
    dto: SetProjectInterestDto,
  ) {
    const idea = await this.findPublicDetail(id);
    const role = dto.role?.trim() || DEFAULT_INTEREST_ROLE;
    if (dto.role) {
      const roles = await this.ensureRoles(idea);
      if (!roles.some((item) => item.name === role)) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { role: 'Este cargo não existe neste projeto.' },
        });
      }
    }

    const existing = (
      await this.ideaRepository.findUserInterests(id, userId)
    ).find((item) => item.role === role);
    const interest = await this.ideaRepository.upsertInterest(
      id,
      userId,
      role,
      dto.message?.trim() || null,
    );

    if (!existing && idea.authorId !== userId) {
      await this.notificationsService
        .create({
          userId: idea.authorId,
          type: NotificationType.PROJECT_IDEA_INTEREST,
          title: `Novo interessado em: ${idea.title}`,
          body: 'Alguém quer participar do seu projeto. Veja quem tem interesse na página dele.',
          relatedId: idea.id,
          link: `/projetos/${idea.id}`,
          payload: { ideaId: idea.id, userId },
        })
        .catch(() => undefined);
    }

    return interest;
  }

  /** Cargos da ideia; na primeira leitura nasce com as sugestões padrão. */
  private async ensureRoles(idea: ProjectIdea): Promise<ProjectIdeaRole[]> {
    const roles = await this.ideaRepository.findRoles(idea.id);
    if (roles.length > 0) {
      return roles;
    }
    const suggestions = suggestVacancies({
      text: [idea.title, idea.description, ...idea.tags].join(' '),
      interestByRole: {},
    });
    return this.ideaRepository.addRoles(
      idea.id,
      suggestions.map((suggestion) => PROJECT_ROLE_LABELS[suggestion.role]),
    );
  }

  async listRoles(id: ProjectIdea['id']) {
    const idea = await this.findPublicDetail(id);
    return this.ensureRoles(idea);
  }

  async addRole(
    id: ProjectIdea['id'],
    dto: CreateProjectIdeaRoleDto,
    userId: number,
    canManageAny: boolean,
  ) {
    const idea = await this.findPublicDetail(id);
    this.assertAuthorOrAdmin(
      idea,
      userId,
      canManageAny,
      'Apenas quem propôs o projeto ou a moderação pode gerenciar os cargos.',
    );
    const roles = await this.ensureRoles(idea);
    const name = dto.name.trim().replace(/\s+/g, ' ');
    if (name.length < 2) {
      throw new BadRequestException('Informe o nome do cargo.');
    }
    if (roles.some((role) => role.name.toLowerCase() === name.toLowerCase())) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { name: 'Já existe um cargo com este nome.' },
      });
    }
    if (roles.length >= 20) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { name: 'O projeto já tem o máximo de 20 cargos.' },
      });
    }
    const [created] = await this.ideaRepository.addRoles(id, [name]);
    return created;
  }

  async removeRole(
    id: ProjectIdea['id'],
    roleId: string,
    userId: number,
    canManageAny: boolean,
  ) {
    const idea = await this.findPublicDetail(id);
    this.assertAuthorOrAdmin(
      idea,
      userId,
      canManageAny,
      'Apenas quem propôs o projeto ou a moderação pode gerenciar os cargos.',
    );
    const removed = await this.ideaRepository.removeRole(id, roleId);
    if (!removed) {
      throw new NotFoundException('Cargo não encontrado.');
    }
  }

  async removeInterest(id: ProjectIdea['id'], userId: number, role?: string) {
    await this.findPublicDetail(id);
    await this.ideaRepository.removeInterest(id, userId, role);
  }

  async getMyInterest(id: ProjectIdea['id'], userId: number) {
    const interests = await this.ideaRepository.findUserInterests(id, userId);
    return {
      interested: interests.length > 0,
      roles: interests.map((interest) => interest.role),
    };
  }

  /** Time visível a qualquer membro: quem está em cada cargo (sem a mensagem). */
  async listParticipants(id: ProjectIdea['id']) {
    await this.findPublicDetail(id);
    const interests = await this.ideaRepository.findInterests(id);
    return interests.map((interest) => ({
      id: interest.id,
      ideaId: interest.ideaId,
      userId: interest.userId,
      user: interest.user,
      role: interest.role,
      createdAt: interest.createdAt,
    }));
  }

  async removeParticipant(
    id: ProjectIdea['id'],
    targetUserId: number,
    role: string | undefined,
    userId: number,
    canManageAny: boolean,
  ) {
    const idea = await this.findPublicDetail(id);
    if (targetUserId !== userId) {
      this.assertAuthorOrAdmin(
        idea,
        userId,
        canManageAny,
        'Apenas quem propôs o projeto ou a moderação pode remover alguém.',
      );
    }
    await this.ideaRepository.removeInterest(id, targetUserId, role);
  }

  async listInterests(
    id: ProjectIdea['id'],
    userId: number,
    canManageAny: boolean,
  ) {
    const idea = await this.getOrFail(id);
    this.assertAuthorOrAdmin(
      idea,
      userId,
      canManageAny,
      'Apenas o autor da ideia pode ver os interessados.',
    );
    return this.ideaRepository.findInterests(id);
  }

  async suggestVacancies(
    id: ProjectIdea['id'],
    userId: number,
    canManageAny: boolean,
  ): Promise<SuggestedVacancy[]> {
    const idea = await this.getOrFail(id);
    this.assertAuthorOrAdmin(
      idea,
      userId,
      canManageAny,
      'Apenas o autor da ideia pode ver as sugestões de vagas.',
    );

    const interests = await this.ideaRepository.findInterests(id);
    const interestByRole: Partial<Record<ProjectRole, number>> = {};
    for (const interest of interests) {
      const role = (Object.keys(PROJECT_ROLE_LABELS) as ProjectRole[]).find(
        (key) => PROJECT_ROLE_LABELS[key] === interest.role,
      );
      if (role) {
        interestByRole[role] = (interestByRole[role] ?? 0) + 1;
      }
    }

    return suggestVacancies({
      text: [idea.title, idea.description, ...idea.tags].join(' '),
      interestByRole,
    });
  }
}
