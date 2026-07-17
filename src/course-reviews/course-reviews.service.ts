import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import { CourseReviewRepository } from './infrastructure/persistence/course-review.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { CourseReview } from './domain/course-review';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';

@Injectable()
export class CourseReviewsService {
  constructor(
    private readonly courseReviewRepository: CourseReviewRepository,
    private readonly gamificationProfilesService: GamificationProfilesService,
  ) {}

  async create(createCourseReviewDto: CreateCourseReviewDto, userId: number) {
    const profile = await this.gamificationProfilesService.findByUserId(userId);
    if (!profile) {
      throw new UnprocessableEntityException(
        'Perfil de gamificação não encontrado.',
      );
    }

    return this.courseReviewRepository.create({
      courseId: createCourseReviewDto.courseId,
      profileId: profile.id,
      rating: createCourseReviewDto.rating,
      comment: createCourseReviewDto.comment ?? null,
      provenCompletion: createCourseReviewDto.provenCompletion ?? false,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.courseReviewRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findByCourseId(courseId: CourseReview['courseId']) {
    return this.courseReviewRepository.findByCourseId(courseId);
  }

  findById(id: CourseReview['id']) {
    return this.courseReviewRepository.findById(id);
  }

  findByIds(ids: CourseReview['id'][]) {
    return this.courseReviewRepository.findByIds(ids);
  }

  remove(id: CourseReview['id']) {
    return this.courseReviewRepository.remove(id);
  }
}
