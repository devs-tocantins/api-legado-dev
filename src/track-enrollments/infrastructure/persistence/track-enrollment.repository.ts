import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { TrackEnrollment } from '../../domain/track-enrollment';

export abstract class TrackEnrollmentRepository {
  abstract create(
    data: Omit<TrackEnrollment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<TrackEnrollment>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<TrackEnrollment[]>;

  abstract findById(
    id: TrackEnrollment['id'],
  ): Promise<NullableType<TrackEnrollment>>;

  abstract findByIds(ids: TrackEnrollment['id'][]): Promise<TrackEnrollment[]>;

  abstract findByTrackAndProfile(
    trackId: TrackEnrollment['trackId'],
    profileId: TrackEnrollment['profileId'],
  ): Promise<NullableType<TrackEnrollment>>;

  abstract update(
    id: TrackEnrollment['id'],
    payload: DeepPartial<TrackEnrollment>,
  ): Promise<TrackEnrollment | null>;

  abstract remove(id: TrackEnrollment['id']): Promise<void>;
}
