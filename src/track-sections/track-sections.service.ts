import { Injectable } from '@nestjs/common';
import { CreateTrackSectionDto } from './dto/create-track-section.dto';
import { UpdateTrackSectionDto } from './dto/update-track-section.dto';
import { TrackSectionRepository } from './infrastructure/persistence/track-section.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { TrackSection } from './domain/track-section';
import { TrackSectionStatus } from './domain/track-section-status.enum';

@Injectable()
export class TrackSectionsService {
  constructor(
    private readonly trackSectionRepository: TrackSectionRepository,
  ) {}

  create(createTrackSectionDto: CreateTrackSectionDto) {
    return this.trackSectionRepository.create({
      trackId: createTrackSectionDto.trackId,
      title: createTrackSectionDto.title,
      description: createTrackSectionDto.description ?? null,
      position: createTrackSectionDto.position,
      status: createTrackSectionDto.status ?? TrackSectionStatus.ACTIVE,
      badgeId: createTrackSectionDto.badgeId ?? null,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.trackSectionRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: TrackSection['id']) {
    return this.trackSectionRepository.findById(id);
  }

  findByIds(ids: TrackSection['id'][]) {
    return this.trackSectionRepository.findByIds(ids);
  }

  findByTrackId(trackId: TrackSection['trackId']) {
    return this.trackSectionRepository.findByTrackId(trackId);
  }

  update(id: TrackSection['id'], updateTrackSectionDto: UpdateTrackSectionDto) {
    return this.trackSectionRepository.update(id, {
      ...(updateTrackSectionDto.trackId !== undefined && {
        trackId: updateTrackSectionDto.trackId,
      }),
      ...(updateTrackSectionDto.title !== undefined && {
        title: updateTrackSectionDto.title,
      }),
      ...(updateTrackSectionDto.description !== undefined && {
        description: updateTrackSectionDto.description,
      }),
      ...(updateTrackSectionDto.position !== undefined && {
        position: updateTrackSectionDto.position,
      }),
      ...(updateTrackSectionDto.status !== undefined && {
        status: updateTrackSectionDto.status,
      }),
      ...(updateTrackSectionDto.badgeId !== undefined && {
        badgeId: updateTrackSectionDto.badgeId,
      }),
    });
  }

  remove(id: TrackSection['id']) {
    return this.trackSectionRepository.remove(id);
  }
}
