import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateTrackSuggestionDto } from './dto/create-track-suggestion.dto';
import { TrackSuggestionRepository } from './infrastructure/persistence/track-suggestion.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { TrackSuggestion } from './domain/track-suggestion';
import { TrackSuggestionStatusEnum } from './domain/track-suggestion-status.enum';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';
import { LearningTracksService } from '../learning-tracks/learning-tracks.service';

@Injectable()
export class TrackSuggestionsService {
  constructor(
    private readonly trackSuggestionRepository: TrackSuggestionRepository,
    private readonly gamificationProfilesService: GamificationProfilesService,
    private readonly learningTracksService: LearningTracksService,
  ) {}

  async create(dto: CreateTrackSuggestionDto, userId: number) {
    const profile = await this.gamificationProfilesService.findByUserId(userId);
    if (!profile) {
      throw new UnprocessableEntityException(
        'Perfil de gamificação não encontrado.',
      );
    }

    if (dto.trackId) {
      const track = await this.learningTracksService.findById(dto.trackId);
      if (!track) {
        throw new NotFoundException('Trilha não encontrada.');
      }
    } else if (!dto.title) {
      throw new UnprocessableEntityException(
        'Informe um nome para a trilha sugerida, ou selecione uma trilha existente para sugerir uma melhoria.',
      );
    }

    return this.trackSuggestionRepository.create({
      profileId: profile.id,
      trackId: dto.trackId ?? null,
      title: dto.trackId ? null : (dto.title ?? null),
      message: dto.message,
      status: TrackSuggestionStatusEnum.PENDING,
      reviewedByProfileId: null,
      reviewedAt: null,
    });
  }

  findAllWithPagination({
    status,
    paginationOptions,
  }: {
    status?: TrackSuggestionStatusEnum;
    paginationOptions: IPaginationOptions;
  }) {
    return this.trackSuggestionRepository.findAllWithPagination({
      status,
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: TrackSuggestion['id']) {
    return this.trackSuggestionRepository.findById(id);
  }

  async markReviewed(id: TrackSuggestion['id'], reviewerUserId: number) {
    const suggestion = await this.trackSuggestionRepository.findById(id);
    if (!suggestion) {
      throw new NotFoundException('Sugestão não encontrada.');
    }

    const reviewerProfile =
      await this.gamificationProfilesService.findByUserId(reviewerUserId);

    return this.trackSuggestionRepository.update(id, {
      status: TrackSuggestionStatusEnum.REVIEWED,
      reviewedByProfileId: reviewerProfile?.id ?? null,
      reviewedAt: new Date(),
    });
  }
}
