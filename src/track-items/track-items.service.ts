import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateTrackItemDto } from './dto/create-track-item.dto';
import { UpdateTrackItemDto } from './dto/update-track-item.dto';
import { TrackItemRepository } from './infrastructure/persistence/track-item.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { TrackItem } from './domain/track-item';
import { TrackItemStatus } from './domain/track-item-status.enum';
import { TrackItemProofFormat } from './domain/track-item-proof-format.enum';
import { TrackItemType } from './domain/track-item-type.enum';
import { TrackItemCompletionsService } from '../track-item-completions/track-item-completions.service';
import { TrackItemCompletionStatus } from '../track-item-completions/domain/track-item-completion-status.enum';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';
import { GamificationProfileEntity } from '../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { TrackItemCompletionEntity } from '../track-item-completions/infrastructure/persistence/relational/entities/track-item-completion.entity';
import { TrackItemCompletionMapper } from '../track-item-completions/infrastructure/persistence/relational/mappers/track-item-completion.mapper';
import { TrackSectionsService } from '../track-sections/track-sections.service';
import { BadgesService } from '../badges/badges.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/domain/notification-type.enum';
import { ActivitiesService } from '../activities/activities.service';

const AUTO_COMPLETABLE_TYPES = [
  TrackItemType.RESOURCE,
  TrackItemType.TEXT,
  TrackItemType.CHECKPOINT,
];

@Injectable()
export class TrackItemsService {
  constructor(
    private readonly trackItemRepository: TrackItemRepository,
    private readonly trackItemCompletionsService: TrackItemCompletionsService,
    private readonly gamificationProfilesService: GamificationProfilesService,
    private readonly trackSectionsService: TrackSectionsService,
    private readonly badgesService: BadgesService,
    private readonly notificationsService: NotificationsService,
    private readonly activitiesService: ActivitiesService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // Marcos PROOF precisam de uma Activity para o fluxo de submissão/moderação
  // existente. Em vez de reaproveitar uma Activity genérica do catálogo (que
  // ficaria visível em /activities e misturaria XP de fontes diferentes),
  // cada marco PROOF ganha sua própria Activity oculta (isHidden), a menos
  // que um activityId já tenha sido informado explicitamente.
  async create(createTrackItemDto: CreateTrackItemDto) {
    let activityId = createTrackItemDto.activityId ?? null;
    const communityXpReward = createTrackItemDto.communityXpReward ?? 0;

    if (!activityId && createTrackItemDto.type === TrackItemType.PROOF) {
      const grantsCommunityXp = createTrackItemDto.grantsCommunityXp ?? false;
      const activity = await this.activitiesService.create({
        title: `Prova: ${createTrackItemDto.title}`,
        description: `Comprovação exclusiva do marco de trilha "${createTrackItemDto.title}".`,
        fixedReward: grantsCommunityXp ? communityXpReward : 0,
        isHidden: true,
        requiresProof: true,
        requiresDescription: false,
        cooldownHours: 0,
      });
      activityId = activity.id;
    }

    return this.trackItemRepository.create({
      trackId: createTrackItemDto.trackId,
      sectionId: createTrackItemDto.sectionId,
      type: createTrackItemDto.type,
      title: createTrackItemDto.title,
      body: createTrackItemDto.body ?? null,
      position: createTrackItemDto.position,
      status: createTrackItemDto.status ?? TrackItemStatus.ACTIVE,
      proofFormat:
        createTrackItemDto.proofFormat ?? TrackItemProofFormat.EITHER,
      isOptional: createTrackItemDto.isOptional ?? false,
      allowsTestOut: createTrackItemDto.allowsTestOut ?? false,
      journeyXp: createTrackItemDto.journeyXp ?? 0,
      grantsCommunityXp: createTrackItemDto.grantsCommunityXp ?? false,
      communityXpReward,
      activityId,
      missionId: createTrackItemDto.missionId ?? null,
      courseId: createTrackItemDto.courseId ?? null,
      config: createTrackItemDto.config ?? null,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.trackItemRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: TrackItem['id']) {
    return this.trackItemRepository.findById(id);
  }

  findByIds(ids: TrackItem['id'][]) {
    return this.trackItemRepository.findByIds(ids);
  }

  findBySectionId(sectionId: TrackItem['sectionId']) {
    return this.trackItemRepository.findBySectionId(sectionId);
  }

  findByTrackId(trackId: TrackItem['trackId']) {
    return this.trackItemRepository.findByTrackId(trackId);
  }

  findByCourseId(courseId: NonNullable<TrackItem['courseId']>) {
    return this.trackItemRepository.findByCourseId(courseId);
  }

  update(id: TrackItem['id'], updateTrackItemDto: UpdateTrackItemDto) {
    return this.trackItemRepository.update(id, {
      ...(updateTrackItemDto.trackId !== undefined && {
        trackId: updateTrackItemDto.trackId,
      }),
      ...(updateTrackItemDto.sectionId !== undefined && {
        sectionId: updateTrackItemDto.sectionId,
      }),
      ...(updateTrackItemDto.type !== undefined && {
        type: updateTrackItemDto.type,
      }),
      ...(updateTrackItemDto.title !== undefined && {
        title: updateTrackItemDto.title,
      }),
      ...(updateTrackItemDto.body !== undefined && {
        body: updateTrackItemDto.body,
      }),
      ...(updateTrackItemDto.position !== undefined && {
        position: updateTrackItemDto.position,
      }),
      ...(updateTrackItemDto.status !== undefined && {
        status: updateTrackItemDto.status,
      }),
      ...(updateTrackItemDto.proofFormat !== undefined && {
        proofFormat: updateTrackItemDto.proofFormat,
      }),
      ...(updateTrackItemDto.isOptional !== undefined && {
        isOptional: updateTrackItemDto.isOptional,
      }),
      ...(updateTrackItemDto.allowsTestOut !== undefined && {
        allowsTestOut: updateTrackItemDto.allowsTestOut,
      }),
      ...(updateTrackItemDto.journeyXp !== undefined && {
        journeyXp: updateTrackItemDto.journeyXp,
      }),
      ...(updateTrackItemDto.grantsCommunityXp !== undefined && {
        grantsCommunityXp: updateTrackItemDto.grantsCommunityXp,
      }),
      ...(updateTrackItemDto.communityXpReward !== undefined && {
        communityXpReward: updateTrackItemDto.communityXpReward,
      }),
      ...(updateTrackItemDto.activityId !== undefined && {
        activityId: updateTrackItemDto.activityId,
      }),
      ...(updateTrackItemDto.missionId !== undefined && {
        missionId: updateTrackItemDto.missionId,
      }),
      ...(updateTrackItemDto.courseId !== undefined && {
        courseId: updateTrackItemDto.courseId,
      }),
      ...(updateTrackItemDto.config !== undefined && {
        config: updateTrackItemDto.config,
      }),
    });
  }

  remove(id: TrackItem['id']) {
    return this.trackItemRepository.remove(id);
  }

  // Conclusão auto-declarada (RESOURCE/TEXT) ou auto-corrigida (CHECKPOINT) —
  // sem moderação. Marcos PROOF fecham pelo fluxo de submissão/moderação
  // existente, não por aqui. Idempotente: repetir não credita XP de novo.
  async completeAuto(itemId: TrackItem['id'], userId: number) {
    const item = await this.trackItemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Marco não encontrado.');
    }
    if (!AUTO_COMPLETABLE_TYPES.includes(item.type)) {
      throw new BadRequestException(
        'Este marco exige prova validada pela moderação, não pode ser concluído automaticamente.',
      );
    }

    const profile = await this.gamificationProfilesService.findByUserId(userId);
    if (!profile) {
      throw new UnprocessableEntityException(
        'Perfil de gamificação não encontrado.',
      );
    }

    const existing =
      await this.trackItemCompletionsService.findByItemAndProfile(
        itemId,
        profile.id,
      );
    if (existing) {
      return existing;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedEntity = await queryRunner.manager.save(
        TrackItemCompletionEntity,
        queryRunner.manager.create(TrackItemCompletionEntity, {
          itemId,
          profileId: profile.id,
          status: TrackItemCompletionStatus.COMPLETED,
          submissionId: null,
          awardedJourneyXp: item.journeyXp,
          completedAt: new Date(),
        }),
      );

      if (item.journeyXp > 0) {
        await queryRunner.manager.increment(
          GamificationProfileEntity,
          { id: profile.id },
          'journeyXp',
          item.journeyXp,
        );
      }

      await queryRunner.commitTransaction();

      void this.evaluateSectionCompletion(item.sectionId, profile.id);

      return TrackItemCompletionMapper.toDomain(savedEntity);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Concede o selo da etapa (section.badgeId) quando todos os marcos
  // obrigatórios e ativos daquela etapa estiverem concluídos. Idempotente
  // (BadgesService.grantByBadgeId já garante isso) — fire-and-forget, igual
  // ao badge-evaluator em outros fluxos de aprovação desta base de código.
  async evaluateSectionCompletion(
    sectionId: TrackItem['sectionId'],
    profileId: string,
  ): Promise<void> {
    const section = await this.trackSectionsService.findById(sectionId);
    if (!section || !section.badgeId) return;

    const items = await this.trackItemRepository.findBySectionId(sectionId);
    const requiredItems = items.filter(
      (i) => !i.isOptional && i.status === TrackItemStatus.ACTIVE,
    );
    if (requiredItems.length === 0) return;

    const completions =
      await this.trackItemCompletionsService.findByProfileId(profileId);
    const completedIds = new Set(completions.map((c) => c.itemId));
    const allDone = requiredItems.every((i) => completedIds.has(i.id));
    if (!allDone) return;

    const granted = await this.badgesService.grantByBadgeId(
      profileId,
      section.badgeId,
    );
    if (!granted) return;

    const profile = await this.gamificationProfilesService.findById(profileId);
    if (profile) {
      void this.notificationsService.create({
        userId: profile.userId,
        type: NotificationType.TRACK_BADGE_GRANTED,
        title: 'Novo selo conquistado!',
        body: `Você concluiu a etapa "${section.title}" e ganhou um novo selo.`,
        relatedId: section.badgeId,
      });
    }
  }
}
