import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { CourseReview } from '../../domain/course-review';

export abstract class CourseReviewRepository {
  abstract create(
    data: Omit<CourseReview, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CourseReview>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<CourseReview[]>;

  abstract findById(
    id: CourseReview['id'],
  ): Promise<NullableType<CourseReview>>;

  abstract findByIds(ids: CourseReview['id'][]): Promise<CourseReview[]>;

  abstract findByCourseId(
    courseId: CourseReview['courseId'],
  ): Promise<CourseReview[]>;

  abstract findByCourseAndProfileId(
    courseId: string,
    profileId: string,
  ): Promise<NullableType<CourseReview>>;

  abstract update(
    id: CourseReview['id'],
    payload: DeepPartial<CourseReview>,
  ): Promise<CourseReview | null>;

  abstract remove(id: CourseReview['id']): Promise<void>;
}
