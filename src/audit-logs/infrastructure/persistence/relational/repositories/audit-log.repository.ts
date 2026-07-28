import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { AuditLog } from '../../../../domain/audit-log';
import { AuditLogRepository } from '../../audit-log.repository';
import { AuditLogMapper } from '../mappers/audit-log.mapper';
import { CreateAuditLogDto } from '../../../../dto/create-audit-log.dto';
import { FindAllAuditLogsDto } from '../../../../dto/find-all-audit-logs.dto';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class AuditLogRelationalRepository implements AuditLogRepository {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  async create(data: CreateAuditLogDto): Promise<AuditLog> {
    const persistenceModel = this.auditLogRepository.create(data);
    const saved = await this.auditLogRepository.save(persistenceModel);
    // saved can be an array if save takes multiple entities, but here it is single
    return AuditLogMapper.toDomain(saved as AuditLogEntity);
  }

  async findAllWithPagination(
    options: IPaginationOptions,
    filters: FindAllAuditLogsDto,
  ): Promise<AuditLog[]> {
    const qb = this.auditLogRepository.createQueryBuilder('audit_log');
    
    if (filters.action) {
      qb.andWhere('audit_log.action = :action', { action: filters.action });
    }
    if (filters.entityType) {
      qb.andWhere('audit_log.entityType = :entityType', { entityType: filters.entityType });
    }
    if (filters.actorUserId !== undefined) {
      qb.andWhere('audit_log.actorUserId = :actorUserId', { actorUserId: filters.actorUserId });
    }
    if (filters.targetUserId !== undefined) {
      qb.andWhere('audit_log.targetUserId = :targetUserId', { targetUserId: filters.targetUserId });
    }

    qb.orderBy('audit_log.createdAt', 'DESC');
    qb.skip((options.page - 1) * options.limit).take(options.limit);

    const entities = await qb.getMany();
    return entities.map((entity) => AuditLogMapper.toDomain(entity));
  }
}
