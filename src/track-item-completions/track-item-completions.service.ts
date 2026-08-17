import { Injectable } from '@nestjs/common';
import { CreateTrackItemCompletionDto } from './dto/create-track-item-completion.dto';
import { TrackItemCompletionRepository } from './infrastructure/persistence/track-item-completion.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { TrackItemCompletion } from './domain/track-item-completion';
import { TrackItemCompletionStatus } from './domain/track-item-completion-status.enum';

@Injectable()
export class TrackItemCompletionsService {
  constructor(
    private readonly trackItemCompletionRepository: TrackItemCompletionRepository,
  ) {}

  create(createTrackItemCompletionDto: CreateTrackItemCompletionDto) {
    return this.trackItemCompletionRepository.create({
      itemId: createTrackItemCompletionDto.itemId,
      profileId: createTrackItemCompletionDto.profileId,
      status:
        createTrackItemCompletionDto.status ??
        TrackItemCompletionStatus.COMPLETED,
      submissionId: createTrackItemCompletionDto.submissionId ?? null,
      awardedJourneyXp: createTrackItemCompletionDto.awardedJourneyXp ?? 0,
      completedAt: new Date(),
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.trackItemCompletionRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: TrackItemCompletion['id']) {
    return this.trackItemCompletionRepository.findById(id);
  }

  findByIds(ids: TrackItemCompletion['id'][]) {
    return this.trackItemCompletionRepository.findByIds(ids);
  }

  findByProfileId(profileId: TrackItemCompletion['profileId']) {
    return this.trackItemCompletionRepository.findByProfileId(profileId);
  }

  findByItemAndProfile(itemId: string, profileId: string) {
    return this.trackItemCompletionRepository.findByItemAndProfile(
      itemId,
      profileId,
    );
  }

  remove(id: TrackItemCompletion['id']) {
    return this.trackItemCompletionRepository.remove(id);
  }
}
