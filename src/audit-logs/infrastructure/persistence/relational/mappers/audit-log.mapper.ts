import { AuditLog } from '../../../../domain/audit-log';
import { AuditLogEntity } from '../entities/audit-log.entity';

export class AuditLogMapper {
  static toDomain(raw: AuditLogEntity): AuditLog {
    const domainEntity = new AuditLog();
    domainEntity.id = raw.id;
    domainEntity.actorUserId = raw.actorUserId;
    domainEntity.action = raw.action;
    domainEntity.entityType = raw.entityType;
    domainEntity.entityId = raw.entityId;
    domainEntity.targetUserId = raw.targetUserId;
    domainEntity.metadata = raw.metadata;
    domainEntity.createdAt = raw.createdAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: AuditLog): AuditLogEntity {
    const persistenceEntity = new AuditLogEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.actorUserId = domainEntity.actorUserId;
    persistenceEntity.action = domainEntity.action;
    persistenceEntity.entityType = domainEntity.entityType;
    persistenceEntity.entityId = domainEntity.entityId;
    persistenceEntity.targetUserId = domainEntity.targetUserId;
    persistenceEntity.metadata = domainEntity.metadata;
    persistenceEntity.createdAt = domainEntity.createdAt;
    return persistenceEntity;
  }
}
