import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RankingSnapshotRepository } from './infrastructure/persistence/ranking-snapshot.repository';
import { GamificationProfileRepository } from '../gamification-profiles/infrastructure/persistence/gamification-profile.repository';
import { GamificationProfileEntity } from '../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { RankingPeriodType } from './domain/ranking-period-type.enum';
import { RankingSnapshot } from './domain/ranking-snapshot';
import { NullableType } from '../utils/types/nullable.type';

@Injectable()
export class RankingSnapshotsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly rankingSnapshotRepository: RankingSnapshotRepository,
    private readonly gamificationProfileRepository: GamificationProfileRepository,
  ) {}

  async snapshotPeriod(
    periodType: 'monthly' | 'annual' | RankingPeriodType,
    periodKey: string,
  ): Promise<void> {
    const typeEnum = periodType as RankingPeriodType;
    const profiles = await this.dataSource
      .getRepository(GamificationProfileEntity)
      .find({
        order:
          typeEnum === RankingPeriodType.MONTHLY
            ? { currentMonthlyXp: 'DESC' }
            : { currentYearlyXp: 'DESC' },
      });

    const snapshotsToCreate: Omit<RankingSnapshot, 'id' | 'createdAt'>[] = [];
    let position = 1;

    for (const profile of profiles) {
      const xpAtSnapshot =
        typeEnum === RankingPeriodType.MONTHLY
          ? profile.currentMonthlyXp
          : profile.currentYearlyXp;

      if (xpAtSnapshot <= 0) {
        continue;
      }

      snapshotsToCreate.push({
        profileId: profile.id,
        periodType: typeEnum,
        periodKey,
        position,
        xpAtSnapshot,
      });

      position++;
    }

    if (snapshotsToCreate.length > 0) {
      await this.rankingSnapshotRepository.createMany(snapshotsToCreate);
    }
  }

  async getChampion(
    periodType: 'monthly' | 'annual' | RankingPeriodType,
  ): Promise<NullableType<RankingSnapshot>> {
    const typeEnum = periodType as RankingPeriodType;
    const snapshot =
      await this.rankingSnapshotRepository.findChampion(typeEnum);

    if (!snapshot) {
      return null;
    }

    const profile = await this.gamificationProfileRepository.findById(
      snapshot.profileId,
    );

    return {
      ...snapshot,
      profile: profile ?? null,
    };
  }

  async getProfileHistory(profileId: string): Promise<RankingSnapshot[]> {
    return this.rankingSnapshotRepository.findByProfileId(profileId);
  }
}
