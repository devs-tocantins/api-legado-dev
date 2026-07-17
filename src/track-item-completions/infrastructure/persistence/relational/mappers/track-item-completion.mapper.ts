import { TrackItemCompletion } from '../../../../domain/track-item-completion';
import { TrackItemCompletionEntity } from '../entities/track-item-completion.entity';

export class TrackItemCompletionMapper {
  static toDomain(raw: TrackItemCompletionEntity): TrackItemCompletion {
    const domainEntity = new TrackItemCompletion();
    domainEntity.id = raw.id;
    domainEntity.itemId = raw.itemId;
    domainEntity.profileId = raw.profileId;
    domainEntity.status = raw.status;
    domainEntity.submissionId = raw.submissionId;
    domainEntity.awardedJourneyXp = raw.awardedJourneyXp;
    domainEntity.completedAt = raw.completedAt;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(
    domainEntity: TrackItemCompletion,
  ): TrackItemCompletionEntity {
    const persistenceEntity = new TrackItemCompletionEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.itemId = domainEntity.itemId;
    persistenceEntity.profileId = domainEntity.profileId;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.submissionId = domainEntity.submissionId;
    persistenceEntity.awardedJourneyXp = domainEntity.awardedJourneyXp;
    persistenceEntity.completedAt = domainEntity.completedAt;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    return persistenceEntity;
  }
}
