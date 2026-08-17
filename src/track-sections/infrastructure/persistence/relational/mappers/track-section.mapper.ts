import { TrackSection } from '../../../../domain/track-section';
import { TrackSectionEntity } from '../entities/track-section.entity';

export class TrackSectionMapper {
  static toDomain(raw: TrackSectionEntity): TrackSection {
    const domainEntity = new TrackSection();
    domainEntity.id = raw.id;
    domainEntity.trackId = raw.trackId;
    domainEntity.title = raw.title;
    domainEntity.description = raw.description;
    domainEntity.position = raw.position;
    domainEntity.status = raw.status;
    domainEntity.badgeId = raw.badgeId;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: TrackSection): TrackSectionEntity {
    const persistenceEntity = new TrackSectionEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.trackId = domainEntity.trackId;
    persistenceEntity.title = domainEntity.title;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.position = domainEntity.position;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.badgeId = domainEntity.badgeId;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    return persistenceEntity;
  }
}
