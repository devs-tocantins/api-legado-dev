import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { LearningTrack } from '../../domain/learning-track';

export abstract class LearningTrackRepository {
  abstract create(
    data: Omit<LearningTrack, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<LearningTrack>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<LearningTrack[]>;

  abstract findById(
    id: LearningTrack['id'],
  ): Promise<NullableType<LearningTrack>>;

  abstract findByIds(ids: LearningTrack['id'][]): Promise<LearningTrack[]>;

  abstract findBySlug(
    slug: LearningTrack['slug'],
  ): Promise<NullableType<LearningTrack>>;

  abstract update(
    id: LearningTrack['id'],
    payload: DeepPartial<LearningTrack>,
  ): Promise<LearningTrack | null>;

  abstract remove(id: LearningTrack['id']): Promise<void>;
}
