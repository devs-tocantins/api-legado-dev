import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { TrackSection } from '../../domain/track-section';

export abstract class TrackSectionRepository {
  abstract create(
    data: Omit<TrackSection, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<TrackSection>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<TrackSection[]>;

  abstract findById(
    id: TrackSection['id'],
  ): Promise<NullableType<TrackSection>>;

  abstract findByIds(ids: TrackSection['id'][]): Promise<TrackSection[]>;

  abstract findByTrackId(
    trackId: TrackSection['trackId'],
  ): Promise<TrackSection[]>;

  abstract update(
    id: TrackSection['id'],
    payload: DeepPartial<TrackSection>,
  ): Promise<TrackSection | null>;

  abstract remove(id: TrackSection['id']): Promise<void>;
}
