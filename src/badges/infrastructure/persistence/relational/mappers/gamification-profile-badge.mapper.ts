import { GamificationProfileBadge } from '../../../../domain/gamification-profile-badge';
import { GamificationProfileBadgeEntity } from '../entities/gamification-profile-badge.entity';
import { BadgeMapper } from './badge.mapper';

export class GamificationProfileBadgeMapper {
  static toDomain(
    raw: GamificationProfileBadgeEntity,
  ): GamificationProfileBadge {
    const domain = new GamificationProfileBadge();
    domain.id = raw.id;
    domain.profileId = raw.profileId;
    domain.badgeId = raw.badgeId;
    if (raw.badge) {
      domain.badge = BadgeMapper.toDomain(raw.badge);
    }
    domain.unlockedAt = raw.unlockedAt;
    domain.grantedBy = raw.grantedBy ?? null;
    return domain;
  }
}
