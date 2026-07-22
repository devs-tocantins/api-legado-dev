import { Course } from '../../../../domain/course';
import { CourseEntity } from '../entities/course.entity';

export class CourseMapper {
  static toDomain(raw: CourseEntity): Course {
    const domainEntity = new Course();
    domainEntity.id = raw.id;
    domainEntity.title = raw.title;
    domainEntity.description = raw.description;
    domainEntity.provider = raw.provider;
    domainEntity.url = raw.url;
    domainEntity.isFree = raw.isFree;
    domainEntity.price = raw.price;
    domainEntity.language = raw.language;
    domainEntity.submittedByProfileId = raw.submittedByProfileId;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Course): CourseEntity {
    const persistenceEntity = new CourseEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.title = domainEntity.title;
    persistenceEntity.description = domainEntity.description ?? null;
    persistenceEntity.provider = domainEntity.provider;
    persistenceEntity.url = domainEntity.url;
    persistenceEntity.isFree = domainEntity.isFree;
    persistenceEntity.price = domainEntity.price;
    persistenceEntity.language = domainEntity.language;
    persistenceEntity.submittedByProfileId = domainEntity.submittedByProfileId;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    return persistenceEntity;
  }
}
