import { Injectable } from '@nestjs/common';
import { CreateLearningTrackDto } from './dto/create-learning-track.dto';
import { UpdateLearningTrackDto } from './dto/update-learning-track.dto';
import { LearningTrackRepository } from './infrastructure/persistence/learning-track.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { LearningTrack } from './domain/learning-track';
import { LearningTrackStatus } from './domain/learning-track-status.enum';

@Injectable()
export class LearningTracksService {
  constructor(
    private readonly learningTrackRepository: LearningTrackRepository,
  ) {}

  create(createLearningTrackDto: CreateLearningTrackDto) {
    return this.learningTrackRepository.create({
      slug: createLearningTrackDto.slug,
      title: createLearningTrackDto.title,
      description: createLearningTrackDto.description ?? null,
      area: createLearningTrackDto.area,
      tier: createLearningTrackDto.tier,
      status: createLearningTrackDto.status ?? LearningTrackStatus.DRAFT,
      requiresTrackId: createLearningTrackDto.requiresTrackId ?? null,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.learningTrackRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: LearningTrack['id']) {
    return this.learningTrackRepository.findById(id);
  }

  findByIds(ids: LearningTrack['id'][]) {
    return this.learningTrackRepository.findByIds(ids);
  }

  findBySlug(slug: LearningTrack['slug']) {
    return this.learningTrackRepository.findBySlug(slug);
  }

  update(
    id: LearningTrack['id'],
    updateLearningTrackDto: UpdateLearningTrackDto,
  ) {
    return this.learningTrackRepository.update(id, {
      ...(updateLearningTrackDto.slug !== undefined && {
        slug: updateLearningTrackDto.slug,
      }),
      ...(updateLearningTrackDto.title !== undefined && {
        title: updateLearningTrackDto.title,
      }),
      ...(updateLearningTrackDto.description !== undefined && {
        description: updateLearningTrackDto.description,
      }),
      ...(updateLearningTrackDto.area !== undefined && {
        area: updateLearningTrackDto.area,
      }),
      ...(updateLearningTrackDto.tier !== undefined && {
        tier: updateLearningTrackDto.tier,
      }),
      ...(updateLearningTrackDto.status !== undefined && {
        status: updateLearningTrackDto.status,
      }),
      ...(updateLearningTrackDto.requiresTrackId !== undefined && {
        requiresTrackId: updateLearningTrackDto.requiresTrackId,
      }),
    });
  }

  remove(id: LearningTrack['id']) {
    return this.learningTrackRepository.remove(id);
  }
}
