import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { RedeemSecretCodeDto } from './dto/redeem-secret-code.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionRepository } from './infrastructure/persistence/submission.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Submission } from './domain/submission';
import { SubmissionStatus } from './domain/submission-status.enum';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';
import { ActivitiesService } from '../activities/activities.service';
import { BadgeEvaluatorService } from '../badges/badge-evaluator.service';
import { GamificationProfileEntity } from '../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { SubmissionEntity } from './infrastructure/persistence/relational/entities/submission.entity';
import { TransactionEntity } from '../transactions/infrastructure/persistence/relational/entities/transaction.entity';
import { TransactionCategoryEnum } from '../transactions/domain/transaction-category.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/domain/notification-type.enum';
import { FilesService } from '../files/files.service';

const MODERATOR_REWARD_XP = 10;

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly gamificationProfilesService: GamificationProfilesService,
    private readonly activitiesService: ActivitiesService,
    private readonly badgeEvaluatorService: BadgeEvaluatorService,
    private readonly notificationsService: NotificationsService,
    private readonly filesService: FilesService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto, userId: number) {
    const profile = await this.gamificationProfilesService.findByUserId(userId);
    if (!profile) {
      throw new UnprocessableEntityException(
        'Perfil de gamificação não encontrado. Crie seu perfil antes de submeter.',
      );
    }

    if (profile.isBanned) {
      throw new ForbiddenException(
        'Sua conta está banida e não pode realizar submissões.',
      );
    }

    const activity = await this.activitiesService.findById(
      createSubmissionDto.activityId,
    );
    if (!activity) {
      throw new NotFoundException('Atividade não encontrada.');
    }

    if (activity.requiresProof && !createSubmissionDto.proofUrl) {
      throw new BadRequestException(
        'Esta atividade exige um comprovante (proofUrl).',
      );
    }

    if (activity.requiresDescription && !createSubmissionDto.description) {
      throw new BadRequestException(
        'Esta atividade exige uma descrição (description).',
      );
    }

    if (activity.cooldownHours > 0) {
      const since = new Date();
      since.setHours(since.getHours() - activity.cooldownHours);

      const recent =
        await this.submissionRepository.findRecentByProfileAndActivity(
          profile.id,
          activity.id,
          since,
        );

      if (recent.length > 0) {
        throw new BadRequestException(
          `Você já submeteu esta atividade recentemente. Aguarde ${activity.cooldownHours}h antes de tentar novamente.`,
        );
      }
    }

    return this.submissionRepository.create({
      profileId: profile.id,
      activityId: activity.id,
      proofUrl: createSubmissionDto.proofUrl ?? null,
      description: createSubmissionDto.description ?? null,
      status: SubmissionStatus.PENDING,
      feedback: null,
      awardedXp: 0,
      reviewerId: null,
      reviewedAt: null,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.submissionRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  async findMySubmissions(
    userId: number,
    paginationOptions: IPaginationOptions,
  ) {
    const profile = await this.gamificationProfilesService.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil de gamificação não encontrado.');
    }

    return this.submissionRepository.findByProfileId(
      profile.id,
      paginationOptions,
    );
  }

  findPending(paginationOptions: IPaginationOptions) {
    return this.submissionRepository.findPending(paginationOptions);
  }

  findApprovedByProfileId(
    profileId: Submission['profileId'],
    paginationOptions: IPaginationOptions,
  ) {
    return this.submissionRepository.findApprovedByProfileId(
      profileId,
      paginationOptions,
    );
  }

  findById(id: Submission['id']) {
    return this.submissionRepository.findById(id);
  }

  findByIds(ids: Submission['id'][]) {
    return this.submissionRepository.findByIds(ids);
  }

  async update(id: Submission['id'], updateSubmissionDto: UpdateSubmissionDto) {
    return this.submissionRepository.update(id, {
      ...(updateSubmissionDto.proofUrl !== undefined && {
        proofUrl: updateSubmissionDto.proofUrl,
      }),
    });
  }

  async review(
    id: Submission['id'],
    reviewDto: ReviewSubmissionDto,
    reviewerUserId: number,
  ) {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      throw new NotFoundException('Submissão não encontrada.');
    }

    const reviewerProfile =
      await this.gamificationProfilesService.findByUserId(reviewerUserId);
    if (reviewerProfile && reviewerProfile.id === submission.profileId) {
      throw new ForbiddenException(
        'Você não pode revisar sua própria submissão.',
      );
    }

    if (submission.status !== SubmissionStatus.PENDING) {
      throw new BadRequestException(
        'Somente submissões com status PENDING podem ser revisadas.',
      );
    }
    if (reviewDto.status === SubmissionStatus.REJECTED && !reviewDto.feedback) {
      throw new BadRequestException(
        'É obrigatório informar um feedback ao rejeitar uma submissão.',
      );
    }

    const activity = await this.activitiesService.findById(
      submission.activityId,
    );
    if (!activity) {
      throw new UnprocessableEntityException(
        'Atividade relacionada à submissão não encontrada.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const awardedXp =
        reviewDto.status === SubmissionStatus.APPROVED
          ? activity.fixedReward
          : 0;

      await queryRunner.manager.update(SubmissionEntity, id, {
        status: reviewDto.status,
        feedback: reviewDto.feedback ?? null,
        awardedXp,
        reviewerId: reviewerUserId,
        reviewedAt: new Date(),
      });

      if (reviewDto.status === SubmissionStatus.APPROVED) {
        await queryRunner.manager.increment(
          GamificationProfileEntity,
          { id: submission.profileId },
          'totalXp',
          awardedXp,
        );
        await queryRunner.manager.increment(
          GamificationProfileEntity,
          { id: submission.profileId },
          'currentMonthlyXp',
          awardedXp,
        );
        await queryRunner.manager.increment(
          GamificationProfileEntity,
          { id: submission.profileId },
          'currentYearlyXp',
          awardedXp,
        );

        await queryRunner.manager.save(TransactionEntity, {
          profile: { id: submission.profileId },
          category: TransactionCategoryEnum.XP_REWARD,
          amount: awardedXp,
          description: `Atividade aprovada: ${activity.title}`,
        });
      }

      const moderatorProfile =
        await this.gamificationProfilesService.findByUserId(reviewerUserId);
      if (moderatorProfile) {
        await queryRunner.manager.increment(
          GamificationProfileEntity,
          { id: moderatorProfile.id },
          'totalXp',
          MODERATOR_REWARD_XP,
        );
        await queryRunner.manager.increment(
          GamificationProfileEntity,
          { id: moderatorProfile.id },
          'currentMonthlyXp',
          MODERATOR_REWARD_XP,
        );
        await queryRunner.manager.increment(
          GamificationProfileEntity,
          { id: moderatorProfile.id },
          'currentYearlyXp',
          MODERATOR_REWARD_XP,
        );

        await queryRunner.manager.save(TransactionEntity, {
          profile: { id: moderatorProfile.id },
          category: TransactionCategoryEnum.AUDITOR_REWARD,
          amount: MODERATOR_REWARD_XP,
          description: 'Recompensa por auditoria de submissão',
        });
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    if (reviewDto.status === SubmissionStatus.APPROVED) {
      void this.badgeEvaluatorService.evaluate(submission.profileId);

      const ownerProfile = await this.dataSource
        .getRepository(GamificationProfileEntity)
        .findOne({ where: { id: submission.profileId } });
      if (ownerProfile) {
        void this.notificationsService.create({
          userId: ownerProfile.userId,
          type: NotificationType.SUBMISSION_APPROVED,
          title: 'Submissão aprovada!',
          body: `Sua submissão foi aprovada e você ganhou ${activity.fixedReward} XP.`,
          relatedId: id,
        });
      }
    }

    if (reviewDto.status === SubmissionStatus.REJECTED && submission.proofUrl) {
      void this.filesService.deleteFile(
        this.filesService.extractStoragePath(submission.proofUrl),
      );
    }

    return this.submissionRepository.findById(id);
  }

  async redeemSecretCode(dto: RedeemSecretCodeDto, userId: number) {
    const profile = await this.gamificationProfilesService.findByUserId(userId);
    if (!profile) {
      throw new UnprocessableEntityException(
        'Perfil de gamificação não encontrado.',
      );
    }

    if (profile.isBanned) {
      throw new ForbiddenException(
        'Sua conta está banida e não pode resgatar códigos.',
      );
    }

    const activity = await this.activitiesService.findBySecretCode(
      dto.secretCode,
    );
    if (!activity) {
      throw new NotFoundException(
        'Código inválido ou atividade não encontrada.',
      );
    }

    if (activity.cooldownHours > 0) {
      const since = new Date();
      since.setHours(since.getHours() - activity.cooldownHours);
      const recent =
        await this.submissionRepository.findRecentByProfileAndActivity(
          profile.id,
          activity.id,
          since,
        );
      if (recent.length > 0) {
        throw new BadRequestException(
          `Você já resgatou este código recentemente. Aguarde ${activity.cooldownHours}h.`,
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let submissionId: string;

    try {
      const submission = await this.submissionRepository.create({
        profileId: profile.id,
        activityId: activity.id,
        proofUrl: null,
        description: null,
        status: SubmissionStatus.APPROVED,
        feedback: null,
        awardedXp: activity.fixedReward,
        reviewerId: null,
        reviewedAt: new Date(),
      });
      submissionId = submission.id;

      await queryRunner.manager.increment(
        GamificationProfileEntity,
        { id: profile.id },
        'totalXp',
        activity.fixedReward,
      );
      await queryRunner.manager.increment(
        GamificationProfileEntity,
        { id: profile.id },
        'currentMonthlyXp',
        activity.fixedReward,
      );
      await queryRunner.manager.increment(
        GamificationProfileEntity,
        { id: profile.id },
        'currentYearlyXp',
        activity.fixedReward,
      );

      await queryRunner.manager.save(TransactionEntity, {
        profile: { id: profile.id },
        category: TransactionCategoryEnum.XP_REWARD,
        amount: activity.fixedReward,
        description: `Código secreto resgatado: ${activity.title}`,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    void this.badgeEvaluatorService.evaluate(profile.id);

    return this.submissionRepository.findById(submissionId!);
  }

  async cancel(id: Submission['id'], userId: number) {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      throw new NotFoundException('Submissão não encontrada.');
    }

    const profile = await this.gamificationProfilesService.findByUserId(userId);
    if (!profile || profile.id !== submission.profileId) {
      throw new ForbiddenException(
        'Você não pode cancelar a submissão de outro usuário.',
      );
    }

    if (submission.status !== SubmissionStatus.PENDING) {
      throw new BadRequestException(
        'Somente submissões pendentes podem ser canceladas.',
      );
    }

    await this.submissionRepository.remove(id);

    if (submission.proofUrl) {
      void this.filesService.deleteFile(
        this.filesService.extractStoragePath(submission.proofUrl),
      );
    }
  }

  remove(id: Submission['id']) {
    return this.submissionRepository.remove(id);
  }
}
