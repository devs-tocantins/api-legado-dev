import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { GamificationProfile } from '../../domain/gamification-profile';

export abstract class GamificationProfileRepository {
  abstract create(
    data: Omit<GamificationProfile, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<GamificationProfile>;

  abstract findAllWithPagination({
    paginationOptions,
    sort,
    search,
  }: {
    paginationOptions: IPaginationOptions;
    sort?: Array<{ orderBy: string; order: 'ASC' | 'DESC' }>;
    search?: string;
  }): Promise<GamificationProfile[]>;

  abstract findById(
    id: GamificationProfile['id'],
  ): Promise<NullableType<GamificationProfile>>;

  abstract findByIds(
    ids: GamificationProfile['id'][],
  ): Promise<GamificationProfile[]>;

  abstract update(
    id: GamificationProfile['id'],
    payload: DeepPartial<GamificationProfile>,
  ): Promise<GamificationProfile | null>;

  abstract remove(id: GamificationProfile['id']): Promise<void>;

  abstract findByUserId(
    userId: GamificationProfile['userId'],
  ): Promise<NullableType<GamificationProfile>>;

  abstract findByUsername(
    username: GamificationProfile['username'],
  ): Promise<NullableType<GamificationProfile>>;

  abstract resetMonthlyXpAndTokens(defaultTokens: number): Promise<void>;

  abstract replenishDailyTokens(defaultTokens: number): Promise<void>;

  abstract resetYearlyXp(): Promise<void>;
}
