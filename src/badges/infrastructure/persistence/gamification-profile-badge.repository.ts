import { NullableType } from '../../../utils/types/nullable.type';
import { GamificationProfileBadge } from '../../domain/gamification-profile-badge';

export abstract class GamificationProfileBadgeRepository {
  abstract create(
    data: Omit<GamificationProfileBadge, 'id' | 'unlockedAt' | 'badge'>,
  ): Promise<GamificationProfileBadge>;

  abstract findByProfileId(
    profileId: string,
  ): Promise<GamificationProfileBadge[]>;

  abstract findByProfileAndBadge(
    profileId: string,
    badgeId: string,
  ): Promise<NullableType<GamificationProfileBadge>>;
}
