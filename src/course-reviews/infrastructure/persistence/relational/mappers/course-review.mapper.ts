import { CourseReview } from '../../../../domain/course-review';
import { CourseReviewEntity } from '../entities/course-review.entity';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';

export class CourseReviewMapper {
  static toDomain(raw: CourseReviewEntity): CourseReview {
    const domainEntity = new CourseReview();
    domainEntity.id = raw.id;
    domainEntity.courseId = raw.courseId;
    domainEntity.profileId = raw.profileId;
    domainEntity.rating = raw.rating;
    domainEntity.comment = raw.comment;
    domainEntity.provenCompletion = raw.provenCompletion;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    if (raw.profile?.user) {
      domainEntity.user = UserMapper.toDomain(raw.profile.user);
    }
    return domainEntity;
  }

  static toPersistence(domainEntity: CourseReview): CourseReviewEntity {
    const persistenceEntity = new CourseReviewEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.courseId = domainEntity.courseId;
    persistenceEntity.profileId = domainEntity.profileId;
    persistenceEntity.rating = domainEntity.rating;
    persistenceEntity.comment = domainEntity.comment;
    persistenceEntity.provenCompletion = domainEntity.provenCompletion;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    return persistenceEntity;
  }
}
