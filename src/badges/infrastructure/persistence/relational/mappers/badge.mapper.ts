import { Badge } from '../../../../domain/badge';
import { BadgeEntity } from '../entities/badge.entity';

export class BadgeMapper {
  static toDomain(raw: BadgeEntity): Badge {
    const domain = new Badge();
    domain.id = raw.id;
    domain.name = raw.name;
    domain.description = raw.description;
    domain.imageUrl = raw.imageUrl ?? null;
    domain.criteriaType = raw.criteriaType;
    domain.criteriaConfig = raw.criteriaConfig ?? null;
    domain.isActive = raw.isActive;
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    return domain;
  }

  static toPersistence(domain: Badge): BadgeEntity {
    const entity = new BadgeEntity();
    if (domain.id) entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.imageUrl = domain.imageUrl ?? null;
    entity.criteriaType = domain.criteriaType;
    entity.criteriaConfig = domain.criteriaConfig ?? null;
    entity.isActive = domain.isActive;
    return entity;
  }
}
