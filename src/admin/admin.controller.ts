import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AdminService } from './admin.service';
import { AdminMetricsDto } from './admin-metrics.dto';
import { AdminHealthDto } from './admin-health.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(RoleEnum.admin)
@Controller({
  path: 'admin',
  version: '1',
})
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  @ApiOkResponse({ type: AdminMetricsDto })
  getMetrics(): Promise<AdminMetricsDto> {
    return this.adminService.getMetrics();
  }

  @Get('health')
  @ApiOkResponse({ type: AdminHealthDto })
  getHealth(): Promise<AdminHealthDto> {
    return this.adminService.getHealth();
  }
}
