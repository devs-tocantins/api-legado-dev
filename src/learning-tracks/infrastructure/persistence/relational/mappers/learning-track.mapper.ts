import { LearningTrack } from '../../../../domain/learning-track';
import { LearningTrackEntity } from '../entities/learning-track.entity';

export class LearningTrackMapper {
  static toDomain(raw: LearningTrackEntity): LearningTrack {
    const domainEntity = new LearningTrack();
    domainEntity.id = raw.id;
    domainEntity.slug = raw.slug;
    domainEntity.title = raw.title;
    domainEntity.description = raw.description;
    domainEntity.area = raw.area;
    domainEntity.tier = raw.tier;
    domainEntity.status = raw.status;
    domainEntity.requiresTrackId = raw.requiresTrackId;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: LearningTrack): LearningTrackEntity {
    const persistenceEntity = new LearningTrackEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.slug = domainEntity.slug;
    persistenceEntity.title = domainEntity.title;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.area = domainEntity.area;
    persistenceEntity.tier = domainEntity.tier;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.requiresTrackId = domainEntity.requiresTrackId;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    return persistenceEntity;
  }
}
