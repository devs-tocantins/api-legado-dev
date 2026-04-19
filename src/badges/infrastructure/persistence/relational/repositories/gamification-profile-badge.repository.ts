import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamificationProfileBadgeEntity } from '../entities/gamification-profile-badge.entity';
import { GamificationProfileBadgeRepository } from '../../gamification-profile-badge.repository';
import { GamificationProfileBadgeMapper } from '../mappers/gamification-profile-badge.mapper';
import { GamificationProfileBadge } from '../../../../domain/gamification-profile-badge';
import { NullableType } from '../../../../../utils/types/nullable.type';

@Injectable()
export class GamificationProfileBadgeRelationalRepository
  implements GamificationProfileBadgeRepository
{
  constructor(
    @InjectRepository(GamificationProfileBadgeEntity)
    private readonly repo: Repository<GamificationProfileBadgeEntity>,
  ) {}

  async create(
    data: Omit<GamificationProfileBadge, 'id' | 'unlockedAt' | 'badge'>,
  ): Promise<GamificationProfileBadge> {
    const entity = this.repo.create({
      profileId: data.profileId,
      badgeId: data.badgeId,
      grantedBy: data.grantedBy ?? null,
    });
    const saved = await this.repo.save(entity);
    // reload with badge relation
    const withBadge = await this.repo.findOne({
      where: { id: saved.id },
      relations: { badge: true },
    });
    return GamificationProfileBadgeMapper.toDomain(withBadge!);
  }

  async findByProfileId(
    profileId: string,
  ): Promise<GamificationProfileBadge[]> {
    const entities = await this.repo.find({
      where: { profileId },
      relations: { badge: true },
      order: { unlockedAt: 'DESC' },
    });
    return entities.map(GamificationProfileBadgeMapper.toDomain);
  }

  async findByProfileAndBadge(
    profileId: string,
    badgeId: string,
  ): Promise<NullableType<GamificationProfileBadge>> {
    const entity = await this.repo.findOne({ where: { profileId, badgeId } });
    return entity ? GamificationProfileBadgeMapper.toDomain(entity) : null;
  }
}
