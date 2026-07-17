import { Injectable } from '@nestjs/common';
import { CreateTrackItemDto } from './dto/create-track-item.dto';
import { UpdateTrackItemDto } from './dto/update-track-item.dto';
import { TrackItemRepository } from './infrastructure/persistence/track-item.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { TrackItem } from './domain/track-item';
import { TrackItemStatus } from './domain/track-item-status.enum';

@Injectable()
export class TrackItemsService {
  constructor(private readonly trackItemRepository: TrackItemRepository) {}

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
}
