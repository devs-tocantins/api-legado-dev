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
import { TrackItemType } from './domain/track-item-type.enum';
import { TrackItemCompletionsService } from '../track-item-completions/track-item-completions.service';
import { TrackItemCompletionStatus } from '../track-item-completions/domain/track-item-completion-status.enum';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';
import { GamificationProfileEntity } from '../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';

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
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  create(createTrackItemDto: CreateTrackItemDto) {
    return this.trackItemRepository.create({
      trackId: createTrackItemDto.trackId,
      sectionId: createTrackItemDto.sectionId,
      type: createTrackItemDto.type,
      title: createTrackItemDto.title,
      body: createTrackItemDto.body ?? null,
      position: createTrackItemDto.position,
      status: createTrackItemDto.status ?? TrackItemStatus.ACTIVE,
      isOptional: createTrackItemDto.isOptional ?? false,
      allowsTestOut: createTrackItemDto.allowsTestOut ?? false,
      journeyXp: createTrackItemDto.journeyXp ?? 0,
      grantsCommunityXp: createTrackItemDto.grantsCommunityXp ?? false,
      activityId: createTrackItemDto.activityId ?? null,
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
      const completion = await this.trackItemCompletionsService.create({
        itemId,
        profileId: profile.id,
        status: TrackItemCompletionStatus.COMPLETED,
        awardedJourneyXp: item.journeyXp,
      });

      if (item.journeyXp > 0) {
        await queryRunner.manager.increment(
          GamificationProfileEntity,
          { id: profile.id },
          'journeyXp',
          item.journeyXp,
        );
      }

      await queryRunner.commitTransaction();
      return completion;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
