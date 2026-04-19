import { Activity } from '../../../../domain/activity';
import { ActivityEntity } from '../entities/activity.entity';

export class ActivityMapper {
  static toDomain(raw: ActivityEntity): Activity {
    const domainEntity = new Activity();
    domainEntity.id = raw.id;
    domainEntity.title = raw.title;
    domainEntity.description = raw.description;
    domainEntity.fixedReward = raw.fixedReward;
    domainEntity.isHidden = raw.isHidden;
    domainEntity.secretCode = raw.secretCode;
    domainEntity.requiresProof = raw.requiresProof;
    domainEntity.requiresDescription = raw.requiresDescription;
    domainEntity.cooldownHours = raw.cooldownHours;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Activity): ActivityEntity {
    const persistenceEntity = new ActivityEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.title = domainEntity.title;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.fixedReward = domainEntity.fixedReward;
    persistenceEntity.isHidden = domainEntity.isHidden;
    persistenceEntity.secretCode = domainEntity.secretCode;
    persistenceEntity.requiresProof = domainEntity.requiresProof;
    persistenceEntity.requiresDescription = domainEntity.requiresDescription;
    persistenceEntity.cooldownHours = domainEntity.cooldownHours;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
