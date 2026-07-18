import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Course } from '../../domain/course';
import { CourseStatus } from '../../domain/course-status.enum';

export abstract class CourseRepository {
  abstract create(
    data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Course>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Course[]>;

  abstract findByStatusWithPagination({
    status,
    trackItemId,
    paginationOptions,
  }: {
    status: CourseStatus;
    trackItemId?: string;
    paginationOptions: IPaginationOptions;
  }): Promise<Course[]>;

  abstract findById(id: Course['id']): Promise<NullableType<Course>>;

  abstract findByIds(ids: Course['id'][]): Promise<Course[]>;

  abstract update(
    id: Course['id'],
    payload: DeepPartial<Course>,
  ): Promise<Course | null>;

  abstract remove(id: Course['id']): Promise<void>;

  abstract linkToTrackItem(data: {
    trackItemId: string;
    courseId: string;
    submittedByProfileId: string | null;
  }): Promise<void>;
}
