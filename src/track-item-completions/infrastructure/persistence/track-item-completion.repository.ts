import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { TrackItemCompletion } from '../../domain/track-item-completion';

export abstract class TrackItemCompletionRepository {
  abstract create(
    data: Omit<TrackItemCompletion, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<TrackItemCompletion>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<TrackItemCompletion[]>;

  abstract findById(
    id: TrackItemCompletion['id'],
  ): Promise<NullableType<TrackItemCompletion>>;

  abstract findByIds(
    ids: TrackItemCompletion['id'][],
  ): Promise<TrackItemCompletion[]>;

  abstract findByProfileId(
    profileId: TrackItemCompletion['profileId'],
  ): Promise<TrackItemCompletion[]>;

  abstract findByItemAndProfile(
    itemId: TrackItemCompletion['itemId'],
    profileId: TrackItemCompletion['profileId'],
  ): Promise<NullableType<TrackItemCompletion>>;

  abstract update(
    id: TrackItemCompletion['id'],
    payload: DeepPartial<TrackItemCompletion>,
  ): Promise<TrackItemCompletion | null>;

  abstract remove(id: TrackItemCompletion['id']): Promise<void>;
}
