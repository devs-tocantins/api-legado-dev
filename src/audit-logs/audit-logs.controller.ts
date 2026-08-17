import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { AuditLogsService } from './audit-logs.service';
import { FindAllAuditLogsDto } from './dto/find-all-audit-logs.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';
import { AuditLog } from './domain/audit-log';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Audit Logs')
@Controller({
  path: 'audit-logs',
  version: '1',
})
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Find all audit logs (Admin only)' })
  async findAll(
    @Query() query: FindAllAuditLogsDto,
  ): Promise<InfinityPaginationResponseDto<AuditLog>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const result = await this.auditLogsService.findAll({ page, limit }, query);

    return infinityPagination(result, { page, limit });
  }
}
