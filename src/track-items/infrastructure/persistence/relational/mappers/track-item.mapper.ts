import { TrackItem } from '../../../../domain/track-item';
import { TrackItemEntity } from '../entities/track-item.entity';

export class TrackItemMapper {
  static toDomain(raw: TrackItemEntity): TrackItem {
    const domainEntity = new TrackItem();
    domainEntity.id = raw.id;
    domainEntity.trackId = raw.trackId;
    domainEntity.sectionId = raw.sectionId;
    domainEntity.type = raw.type;
    domainEntity.title = raw.title;
    domainEntity.body = raw.body;
    domainEntity.position = raw.position;
    domainEntity.status = raw.status;
    domainEntity.isOptional = raw.isOptional;
    domainEntity.allowsTestOut = raw.allowsTestOut;
    domainEntity.journeyXp = raw.journeyXp;
    domainEntity.grantsCommunityXp = raw.grantsCommunityXp;
    domainEntity.communityXpReward = raw.communityXpReward;
    domainEntity.activityId = raw.activityId;
    domainEntity.missionId = raw.missionId;
    domainEntity.courseId = raw.courseId;
    domainEntity.config = raw.config;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: TrackItem): TrackItemEntity {
    const persistenceEntity = new TrackItemEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.trackId = domainEntity.trackId;
    persistenceEntity.sectionId = domainEntity.sectionId;
    persistenceEntity.type = domainEntity.type;
    persistenceEntity.title = domainEntity.title;
    persistenceEntity.body = domainEntity.body;
    persistenceEntity.position = domainEntity.position;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.isOptional = domainEntity.isOptional;
    persistenceEntity.allowsTestOut = domainEntity.allowsTestOut;
    persistenceEntity.journeyXp = domainEntity.journeyXp;
    persistenceEntity.grantsCommunityXp = domainEntity.grantsCommunityXp;
    persistenceEntity.communityXpReward = domainEntity.communityXpReward;
    persistenceEntity.activityId = domainEntity.activityId;
    persistenceEntity.missionId = domainEntity.missionId;
    persistenceEntity.courseId = domainEntity.courseId;
    persistenceEntity.config = domainEntity.config;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    return persistenceEntity;
  }
}
