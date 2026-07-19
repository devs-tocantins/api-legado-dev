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
import { TrackItemsService } from '../track-items/track-items.service';
import { TrackItemType } from '../track-items/domain/track-item-type.enum';
import { TrackItemCompletionEntity } from '../track-item-completions/infrastructure/persistence/relational/entities/track-item-completion.entity';
import { TrackItemCompletionsService } from '../track-item-completions/track-item-completions.service';
import { TrackItemCompletionStatus } from '../track-item-completions/domain/track-item-completion-status.enum';
import { LearningTracksService } from '../learning-tracks/learning-tracks.service';
import { Activity } from '../activities/domain/activity';

const MODERATOR_REWARD_XP = 10;

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly gamificationProfilesService: GamificationProfilesService,
    private readonly activitiesService: ActivitiesService,
    private readonly badgeEvaluatorService: BadgeEvaluatorService,
    private readonly notificationsService: NotificationsService,
    private readonly trackItemsService: TrackItemsService,
    private readonly trackItemCompletionsService: TrackItemCompletionsService,
    private readonly learningTracksService: LearningTracksService,
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

    let activityId = createSubmissionDto.activityId;
    const isTestOut = createSubmissionDto.isTestOut ?? false;

    if (createSubmissionDto.trackItemId) {
      const item = await this.trackItemsService.findById(
        createSubmissionDto.trackItemId,
      );
      if (!item) {
        throw new NotFoundException('Marco de trilha não encontrado.');
      }
      if (!item.activityId) {
        throw new UnprocessableEntityException(
          'Este marco não possui atividade vinculada para comprovação.',
        );
      }

      if (isTestOut) {
        if (!item.allowsTestOut) {
          throw new BadRequestException('Este marco não permite test-out.');
        }
        const reachable = await this.learningTracksService.isSectionReachable(
          item.trackId,
          item.sectionId,
          userId,
        );
        if (!reachable) {
          throw new BadRequestException(
            'Você ainda não chegou a esta etapa da trilha.',
          );
        }
      } else if (item.type !== TrackItemType.PROOF) {
        throw new BadRequestException(
          'Este marco não é do tipo prova e não aceita comprovação.',
        );
      }

      const existingCompletion =
        await this.trackItemCompletionsService.findByItemAndProfile(
          item.id,
          profile.id,
        );
      if (existingCompletion) {
        throw new BadRequestException('Este marco já foi concluído.');
      }

      activityId = item.activityId;
    } else if (!activityId) {
      throw new BadRequestException('Informe activityId ou trackItemId.');
    }

    const activity = await this.activitiesService.findById(activityId);
    if (!activity) {
      throw new NotFoundException('Atividade não encontrada.');
    }

    // Test-out é uma autodeclaração de domínio do assunto — não faz sentido
    // exigir comprovante ou descrição, o moderador decide com base no
    // contexto da trilha, não numa prova anexada.
    if (!isTestOut) {
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
    }

    if (activity.isFreeform && !createSubmissionDto.customTitle) {
      throw new BadRequestException(
        'Esta atividade exige um título (customTitle) descrevendo a contribuição.',
      );
    }

    if (activity.effortTiers && activity.effortTiers.length > 0) {
      if (!createSubmissionDto.effortLevel) {
        throw new BadRequestException(
          'Esta atividade exige a faixa de esforço declarada (effortLevel).',
        );
      }
      const validTier = activity.effortTiers.some(
        (tier) => tier.level === createSubmissionDto.effortLevel,
      );
      if (!validTier) {
        throw new BadRequestException(
          'effortLevel informado não corresponde a nenhuma faixa desta atividade.',
        );
      }
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
      trackItemId: createSubmissionDto.trackItemId ?? null,
      isTestOut,
      proofUrl: createSubmissionDto.proofUrl ?? null,
      description: createSubmissionDto.description ?? null,
      customTitle: createSubmissionDto.customTitle ?? null,
      declaredEffort: createSubmissionDto.effortLevel ?? null,
      status: SubmissionStatus.PENDING,
      feedback: null,
      awardedXp: 0,
      reviewerId: null,
      reviewedAt: null,
    });
  }

  // Resolve o XP efetivo: override do moderador ao aprovar > faixa declarada
  // pelo usuário > fixedReward. Mantém a atividade "confiança + moderação"
  // descrita no plano: o usuário se autodeclara, o moderador confirma/ajusta.
  private resolveAwardedXp(
    activity: Activity,
    submission: Submission,
    reviewDto: ReviewSubmissionDto,
  ): number {
    if (activity.effortTiers && activity.effortTiers.length > 0) {
      const effectiveLevel = reviewDto.effortLevel ?? submission.declaredEffort;
      const tier = activity.effortTiers.find((t) => t.level === effectiveLevel);
      if (tier) return tier.xp;
    }
    return activity.fixedReward;
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

    const trackItem = submission.trackItemId
      ? await this.trackItemsService.findById(submission.trackItemId)
      : null;
    const grantsCommunityXp = !trackItem || trackItem.grantsCommunityXp;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const awardedXp =
        reviewDto.status === SubmissionStatus.APPROVED
          ? this.resolveAwardedXp(activity, submission, reviewDto)
          : 0;

      await queryRunner.manager.update(SubmissionEntity, id, {
        status: reviewDto.status,
        feedback: reviewDto.feedback ?? null,
        awardedXp,
        reviewerId: reviewerUserId,
        reviewedAt: new Date(),
      });

      if (reviewDto.status === SubmissionStatus.APPROVED && grantsCommunityXp) {
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

      if (reviewDto.status === SubmissionStatus.APPROVED && trackItem) {
        const existingCompletion =
          await this.trackItemCompletionsService.findByItemAndProfile(
            trackItem.id,
            submission.profileId,
          );
        if (!existingCompletion) {
          await queryRunner.manager.save(
            TrackItemCompletionEntity,
            queryRunner.manager.create(TrackItemCompletionEntity, {
              itemId: trackItem.id,
              profileId: submission.profileId,
              status: submission.isTestOut
                ? TrackItemCompletionStatus.SKIPPED_TESTOUT
                : TrackItemCompletionStatus.COMPLETED,
              submissionId: id,
              awardedJourneyXp: trackItem.journeyXp,
              completedAt: new Date(),
            }),
          );

          if (trackItem.journeyXp > 0) {
            await queryRunner.manager.increment(
              GamificationProfileEntity,
              { id: submission.profileId },
              'journeyXp',
              trackItem.journeyXp,
            );
          }
        }
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

      if (trackItem) {
        void this.trackItemsService.evaluateSectionCompletion(
          trackItem.sectionId,
          submission.profileId,
        );
      }

      if (ownerProfile) {
        if (trackItem) {
          void this.notificationsService.create({
            userId: ownerProfile.userId,
            type: NotificationType.TRACK_MILESTONE_APPROVED,
            title: 'Marco de trilha aprovado!',
            body: `Sua prova foi aprovada${trackItem.journeyXp > 0 ? ` e você ganhou ${trackItem.journeyXp} XP de Jornada` : ''}.`,
            relatedId: id,
          });
        } else {
          void this.notificationsService.create({
            userId: ownerProfile.userId,
            type: NotificationType.SUBMISSION_APPROVED,
            title: 'Submissão aprovada!',
            body: `Sua submissão foi aprovada e você ganhou ${activity.fixedReward} XP.`,
            relatedId: id,
          });
        }
      }
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
        trackItemId: null,
        isTestOut: false,
        proofUrl: null,
        description: null,
        customTitle: null,
        declaredEffort: null,
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

    return this.submissionRepository.remove(id);
  }

  remove(id: Submission['id']) {
    return this.submissionRepository.remove(id);
  }
}
