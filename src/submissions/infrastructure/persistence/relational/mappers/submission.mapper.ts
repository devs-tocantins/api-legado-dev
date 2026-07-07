import { Submission } from '../../../../domain/submission';
import { SubmissionEntity } from '../entities/submission.entity';

export class SubmissionMapper {
  static toDomain(raw: SubmissionEntity): Submission {
    const domainEntity = new Submission();
    domainEntity.id = raw.id;
    domainEntity.profileId = raw.profileId;
    domainEntity.activityId = raw.activityId;
    domainEntity.proofUrl = raw.proofUrl;
    domainEntity.description = raw.description;
    domainEntity.status = raw.status;
    domainEntity.feedback = raw.feedback;
    domainEntity.awardedXp = raw.awardedXp;
    domainEntity.reviewerId = raw.reviewerId;
    domainEntity.reviewedAt = raw.reviewedAt;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Submission): SubmissionEntity {
    const persistenceEntity = new SubmissionEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.profileId = domainEntity.profileId;
    persistenceEntity.activityId = domainEntity.activityId;
    persistenceEntity.proofUrl = domainEntity.proofUrl;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.feedback = domainEntity.feedback;
    persistenceEntity.awardedXp = domainEntity.awardedXp;
    persistenceEntity.reviewerId = domainEntity.reviewerId;
    persistenceEntity.reviewedAt = domainEntity.reviewedAt;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
