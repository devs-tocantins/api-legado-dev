import { GamificationProfile } from '../../../../domain/gamification-profile';
import { GamificationProfileEntity } from '../entities/gamification-profile.entity';

export class GamificationProfileMapper {
  static toDomain(raw: GamificationProfileEntity): GamificationProfile {
    const domainEntity = new GamificationProfile();
    domainEntity.id = raw.id;
    domainEntity.userId = raw.userId;
    domainEntity.username = raw.username;
    domainEntity.totalXp = raw.totalXp;
    domainEntity.currentMonthlyXp = raw.currentMonthlyXp;
    domainEntity.currentYearlyXp = raw.currentYearlyXp;
    domainEntity.gratitudeTokens = raw.gratitudeTokens;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(
    domainEntity: GamificationProfile,
  ): GamificationProfileEntity {
    const persistenceEntity = new GamificationProfileEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.username = domainEntity.username;
    persistenceEntity.totalXp = domainEntity.totalXp;
    persistenceEntity.currentMonthlyXp = domainEntity.currentMonthlyXp;
    persistenceEntity.currentYearlyXp = domainEntity.currentYearlyXp;
    persistenceEntity.gratitudeTokens = domainEntity.gratitudeTokens;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
