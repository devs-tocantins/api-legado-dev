import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateTrackEnrollmentDto } from './dto/create-track-enrollment.dto';
import { TrackEnrollmentRepository } from './infrastructure/persistence/track-enrollment.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { TrackEnrollment } from './domain/track-enrollment';
import { TrackEnrollmentStatus } from './domain/track-enrollment-status.enum';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';

@Injectable()
export class TrackEnrollmentsService {
  constructor(
    private readonly trackEnrollmentRepository: TrackEnrollmentRepository,
    private readonly gamificationProfilesService: GamificationProfilesService,
  ) {}

  async create(
    createTrackEnrollmentDto: CreateTrackEnrollmentDto,
    userId: number,
  ) {
    const profile = await this.gamificationProfilesService.findByUserId(userId);
    if (!profile) {
      throw new UnprocessableEntityException(
        'Perfil de gamificação não encontrado.',
      );
    }

    const existing = await this.trackEnrollmentRepository.findByTrackAndProfile(
      createTrackEnrollmentDto.trackId,
      profile.id,
    );
    if (existing) {
      return existing;
    }

    return this.trackEnrollmentRepository.create({
      trackId: createTrackEnrollmentDto.trackId,
      profileId: profile.id,
      status: TrackEnrollmentStatus.ACTIVE,
      startedAt: new Date(),
      completedAt: null,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.trackEnrollmentRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: TrackEnrollment['id']) {
    return this.trackEnrollmentRepository.findById(id);
  }

  findByIds(ids: TrackEnrollment['id'][]) {
    return this.trackEnrollmentRepository.findByIds(ids);
  }

  findByTrackAndProfile(trackId: string, profileId: string) {
    return this.trackEnrollmentRepository.findByTrackAndProfile(
      trackId,
      profileId,
    );
  }

  markCompleted(id: TrackEnrollment['id']) {
    return this.trackEnrollmentRepository.update(id, {
      status: TrackEnrollmentStatus.COMPLETED,
      completedAt: new Date(),
    });
  }

  remove(id: TrackEnrollment['id']) {
    return this.trackEnrollmentRepository.remove(id);
  }
}
