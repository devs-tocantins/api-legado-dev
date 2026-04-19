import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Submission } from '../../domain/submission';

export abstract class SubmissionRepository {
  abstract create(
    data: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Submission>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Submission[]>;

  abstract findById(id: Submission['id']): Promise<NullableType<Submission>>;

  abstract findByIds(ids: Submission['id'][]): Promise<Submission[]>;

  abstract update(
    id: Submission['id'],
    payload: DeepPartial<Submission>,
  ): Promise<Submission | null>;

  abstract remove(id: Submission['id']): Promise<void>;

  abstract findByProfileId(
    profileId: Submission['profileId'],
    paginationOptions: IPaginationOptions,
  ): Promise<Submission[]>;

  abstract findApprovedByProfileId(
    profileId: Submission['profileId'],
    paginationOptions: IPaginationOptions,
  ): Promise<Submission[]>;

  abstract findPending(
    paginationOptions: IPaginationOptions,
  ): Promise<Submission[]>;

  abstract findRecentByProfileAndActivity(
    profileId: Submission['profileId'],
    activityId: Submission['activityId'],
    since: Date,
  ): Promise<Submission[]>;
}
