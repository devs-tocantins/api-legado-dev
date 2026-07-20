import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { TrackSuggestion } from '../../domain/track-suggestion';
import { TrackSuggestionStatusEnum } from '../../domain/track-suggestion-status.enum';

export abstract class TrackSuggestionRepository {
  abstract create(
    data: Omit<TrackSuggestion, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<TrackSuggestion>;

  abstract findAllWithPagination({
    status,
    paginationOptions,
  }: {
    status?: TrackSuggestionStatusEnum;
    paginationOptions: IPaginationOptions;
  }): Promise<TrackSuggestion[]>;

  abstract findById(
    id: TrackSuggestion['id'],
  ): Promise<NullableType<TrackSuggestion>>;

  abstract update(
    id: TrackSuggestion['id'],
    payload: DeepPartial<TrackSuggestion>,
  ): Promise<TrackSuggestion | null>;
}
