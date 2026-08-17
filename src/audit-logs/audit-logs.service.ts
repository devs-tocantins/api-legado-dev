import { Injectable, Logger } from '@nestjs/common';
import { AuditLogRepository } from './infrastructure/persistence/audit-log.repository';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { FindAllAuditLogsDto } from './dto/find-all-audit-logs.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { AuditLog } from './domain/audit-log';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async record(data: CreateAuditLogDto): Promise<void> {
    try {
      await this.auditLogRepository.create(data);
    } catch (error) {
      this.logger.error(
        `Failed to record audit log: ${error.message}`,
        error.stack,
        { data },
      );
    }
  }

  async findAll(
    options: IPaginationOptions,
    filters: FindAllAuditLogsDto,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.findAllWithPagination(options, filters);
  }
}
