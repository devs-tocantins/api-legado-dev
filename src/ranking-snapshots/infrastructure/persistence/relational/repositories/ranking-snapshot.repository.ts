import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RankingSnapshotEntity } from '../entities/ranking-snapshot.entity';
import { RankingSnapshotRepository } from '../../ranking-snapshot.repository';
import { RankingSnapshotMapper } from '../mappers/ranking-snapshot.mapper';
import { RankingSnapshot } from '../../../../domain/ranking-snapshot';
import { RankingPeriodType } from '../../../../domain/ranking-period-type.enum';
import { NullableType } from '../../../../utils/types/nullable.type';

@Injectable()
export class RankingSnapshotRelationalRepository
  implements RankingSnapshotRepository
{
  constructor(
    @InjectRepository(RankingSnapshotEntity)
    private readonly snapshotRepository: Repository<RankingSnapshotEntity>,
  ) {}

  async createMany(
    data: Omit<RankingSnapshot, 'id' | 'createdAt'>[],
  ): Promise<void> {
    if (!data.length) return;

    await this.snapshotRepository
      .createQueryBuilder()
      .insert()
      .into(RankingSnapshotEntity)
      .values(data)
      .orIgnore()
      .execute();
  }

  async findChampion(
    periodType: RankingPeriodType,
  ): Promise<NullableType<RankingSnapshot>> {
    const entity = await this.snapshotRepository.findOne({
      where: {
        periodType,
        position: 1,
      },
      order: {
        periodKey: 'DESC',
      },
    });

    return entity ? RankingSnapshotMapper.toDomain(entity) : null;
  }

  async findByProfileId(profileId: string): Promise<RankingSnapshot[]> {
    const entities = await this.snapshotRepository.find({
      where: { profileId },
      order: {
        periodKey: 'DESC',
      },
    });

    return entities.map((entity) => RankingSnapshotMapper.toDomain(entity));
  }

  async findByProfileAndPeriod(
    profileId: string,
    periodType: RankingPeriodType,
    periodKey: string,
  ): Promise<NullableType<RankingSnapshot>> {
    const entity = await this.snapshotRepository.findOne({
      where: {
        profileId,
        periodType,
        periodKey,
      },
    });

    return entity ? RankingSnapshotMapper.toDomain(entity) : null;
  }
}
