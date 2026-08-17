import { TrackSuggestion } from '../../../../domain/track-suggestion';
import { TrackSuggestionEntity } from '../entities/track-suggestion.entity';

export class TrackSuggestionMapper {
  static toDomain(raw: TrackSuggestionEntity): TrackSuggestion {
    const domainEntity = new TrackSuggestion();
    domainEntity.id = raw.id;
    domainEntity.profileId = raw.profileId;
    domainEntity.trackId = raw.trackId;
    domainEntity.title = raw.title;
    domainEntity.message = raw.message;
    domainEntity.status = raw.status;
    domainEntity.reviewedByProfileId = raw.reviewedByProfileId;
    domainEntity.reviewedAt = raw.reviewedAt;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: TrackSuggestion): TrackSuggestionEntity {
    const persistenceEntity = new TrackSuggestionEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.profileId = domainEntity.profileId;
    persistenceEntity.trackId = domainEntity.trackId;
    persistenceEntity.title = domainEntity.title;
    persistenceEntity.message = domainEntity.message;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.reviewedByProfileId = domainEntity.reviewedByProfileId;
    persistenceEntity.reviewedAt = domainEntity.reviewedAt;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    return persistenceEntity;
  }
}
