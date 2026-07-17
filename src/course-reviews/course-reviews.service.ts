import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import { CourseReviewRepository } from './infrastructure/persistence/course-review.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { CourseReview } from './domain/course-review';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';
import { TrackItemsService } from '../track-items/track-items.service';
import { TrackItemCompletionsService } from '../track-item-completions/track-item-completions.service';
import { TrackItemType } from '../track-items/domain/track-item-type.enum';

@Injectable()
export class CourseReviewsService {
  constructor(
    private readonly courseReviewRepository: CourseReviewRepository,
    private readonly gamificationProfilesService: GamificationProfilesService,
    private readonly trackItemsService: TrackItemsService,
    private readonly trackItemCompletionsService: TrackItemCompletionsService,
  ) {}

  private async hasProvenCompletion(
    courseId: string,
    profileId: string,
  ): Promise<boolean> {
    const courseCompletionItems = (
      await this.trackItemsService.findByCourseId(courseId)
    ).filter((item) => item.type === TrackItemType.COURSE_COMPLETION);

    for (const item of courseCompletionItems) {
      const completion =
        await this.trackItemCompletionsService.findByItemAndProfile(
          item.id,
          profileId,
        );
      if (completion) return true;
    }

    return false;
  }

  async create(createCourseReviewDto: CreateCourseReviewDto, userId: number) {
    const profile = await this.gamificationProfilesService.findByUserId(userId);
    if (!profile) {
      throw new UnprocessableEntityException(
        'Perfil de gamificação não encontrado.',
      );
    }

    const provenCompletion = await this.hasProvenCompletion(
      createCourseReviewDto.courseId,
      profile.id,
    );
    if (!provenCompletion) {
      throw new UnprocessableEntityException(
        'Só é possível avaliar um curso após comprovar sua conclusão na trilha.',
      );
    }

    return this.courseReviewRepository.create({
      courseId: createCourseReviewDto.courseId,
      profileId: profile.id,
      rating: createCourseReviewDto.rating,
      comment: createCourseReviewDto.comment ?? null,
      provenCompletion: true,
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
