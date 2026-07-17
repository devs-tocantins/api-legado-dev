import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { TrackItem } from '../../domain/track-item';

export abstract class TrackItemRepository {
  abstract create(
    data: Omit<TrackItem, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<TrackItem>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<TrackItem[]>;

  abstract findById(id: TrackItem['id']): Promise<NullableType<TrackItem>>;

  abstract findByIds(ids: TrackItem['id'][]): Promise<TrackItem[]>;

  abstract findBySectionId(
    sectionId: TrackItem['sectionId'],
  ): Promise<TrackItem[]>;

  abstract findByTrackId(trackId: TrackItem['trackId']): Promise<TrackItem[]>;

  abstract findByCourseId(
    courseId: NonNullable<TrackItem['courseId']>,
  ): Promise<TrackItem[]>;

  abstract update(
    id: TrackItem['id'],
    payload: Partial<TrackItem>,
  ): Promise<TrackItem | null>;

  abstract remove(id: TrackItem['id']): Promise<void>;
}
