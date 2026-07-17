import { TrackEnrollment } from '../../../../domain/track-enrollment';
import { TrackEnrollmentEntity } from '../entities/track-enrollment.entity';

export class TrackEnrollmentMapper {
  static toDomain(raw: TrackEnrollmentEntity): TrackEnrollment {
    const domainEntity = new TrackEnrollment();
    domainEntity.id = raw.id;
    domainEntity.trackId = raw.trackId;
    domainEntity.profileId = raw.profileId;
    domainEntity.status = raw.status;
    domainEntity.startedAt = raw.startedAt;
    domainEntity.completedAt = raw.completedAt;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: TrackEnrollment): TrackEnrollmentEntity {
    const persistenceEntity = new TrackEnrollmentEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.trackId = domainEntity.trackId;
    persistenceEntity.profileId = domainEntity.profileId;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.startedAt = domainEntity.startedAt;
    persistenceEntity.completedAt = domainEntity.completedAt;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    return persistenceEntity;
  }
}
