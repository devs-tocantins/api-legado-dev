import { RankingPeriodType } from '../../domain/ranking-period-type.enum';
import { RankingSnapshot } from '../../domain/ranking-snapshot';
import { NullableType } from '../../../utils/types/nullable.type';

export abstract class RankingSnapshotRepository {
  abstract createMany(
    data: Omit<RankingSnapshot, 'id' | 'createdAt'>[],
  ): Promise<void>;

  abstract findChampion(
    periodType: RankingPeriodType,
  ): Promise<NullableType<RankingSnapshot>>;

  abstract findByProfileId(profileId: string): Promise<RankingSnapshot[]>;

  abstract findByProfileAndPeriod(
    profileId: string,
    periodType: RankingPeriodType,
    periodKey: string,
  ): Promise<NullableType<RankingSnapshot>>;
}
