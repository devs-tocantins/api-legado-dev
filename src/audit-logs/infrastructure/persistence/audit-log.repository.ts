import { AuditLog } from '../../domain/audit-log';
import { CreateAuditLogDto } from '../../dto/create-audit-log.dto';
import { FindAllAuditLogsDto } from '../../dto/find-all-audit-logs.dto';
import { IPaginationOptions } from '../../../utils/types/pagination-options';

export abstract class AuditLogRepository {
  abstract create(data: CreateAuditLogDto): Promise<AuditLog>;
  abstract findAllWithPagination(
    options: IPaginationOptions,
    filters: FindAllAuditLogsDto,
  ): Promise<AuditLog[]>;
}
