import { Event } from '../../../../domain/event';
import { EventEntity } from '../entities/event.entity';
import { buildGoogleCalendarUrl } from '../../../../events-calendar-link.util';
import { FileMapper } from '../../../../../files/infrastructure/persistence/relational/mappers/file.mapper';
import { FileEntity } from '../../../../../files/infrastructure/persistence/relational/entities/file.entity';

export class EventMapper {
  static toDomain(raw: EventEntity): Event {
    const domainEntity = new Event();
    domainEntity.id = raw.id;
    domainEntity.title = raw.title;
    domainEntity.description = raw.description;
    domainEntity.category = raw.category;
    domainEntity.modality = raw.modality;
    domainEntity.startAt = raw.startAt;
    domainEntity.endAt = raw.endAt;
    domainEntity.location = raw.location;
    domainEntity.locationMapUrl = raw.locationMapUrl;
    domainEntity.onlineUrl = raw.onlineUrl;
    domainEntity.externalUrl = raw.externalUrl;
    domainEntity.status = raw.status;
    domainEntity.rejectionReason = raw.rejectionReason;
    domainEntity.organizerId = raw.organizerId;
    domainEntity.reviewerId = raw.reviewerId;
    domainEntity.reviewedAt = raw.reviewedAt;
    domainEntity.coverImageId = raw.coverImageId;
    domainEntity.coverImage = raw.coverImage
      ? FileMapper.toDomain(raw.coverImage)
      : null;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.googleCalendarUrl = buildGoogleCalendarUrl(domainEntity);

    return domainEntity;
  }

  static toPersistence(domainEntity: Event): EventEntity {
    const persistenceEntity = new EventEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    let coverImage: FileEntity | undefined | null = undefined;
    if (domainEntity.coverImageId === null) {
      coverImage = null;
    } else if (
      domainEntity.coverImage &&
      domainEntity.coverImage.id === domainEntity.coverImageId
    ) {
      coverImage = FileMapper.toPersistence(domainEntity.coverImage);
    }

    persistenceEntity.title = domainEntity.title;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.category = domainEntity.category;
    persistenceEntity.modality = domainEntity.modality;
    persistenceEntity.startAt = domainEntity.startAt;
    persistenceEntity.endAt = domainEntity.endAt;
    persistenceEntity.location = domainEntity.location;
    persistenceEntity.locationMapUrl = domainEntity.locationMapUrl ?? null;
    persistenceEntity.onlineUrl = domainEntity.onlineUrl;
    persistenceEntity.externalUrl = domainEntity.externalUrl;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.rejectionReason = domainEntity.rejectionReason;
    persistenceEntity.organizerId = domainEntity.organizerId;
    persistenceEntity.reviewerId = domainEntity.reviewerId;
    persistenceEntity.reviewedAt = domainEntity.reviewedAt;
    persistenceEntity.coverImageId = domainEntity.coverImageId;
    persistenceEntity.coverImage = coverImage as FileEntity;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
