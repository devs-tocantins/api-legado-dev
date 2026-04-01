import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Activity } from '../../domain/activity';

export abstract class ActivityRepository {
  abstract create(
    data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Activity>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Activity[]>;

  abstract findById(id: Activity['id']): Promise<NullableType<Activity>>;

  abstract findByIds(ids: Activity['id'][]): Promise<Activity[]>;

  abstract update(
    id: Activity['id'],
    payload: DeepPartial<Activity>,
  ): Promise<Activity | null>;

  abstract remove(id: Activity['id']): Promise<void>;

  abstract findPublicWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Activity[]>;

  abstract findBySecretCode(
    secretCode: Activity['secretCode'],
  ): Promise<NullableType<Activity>>;
}
