import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { ContributionReportsService } from './contribution-reports.service';
import { CreateContributionReportDto } from './dto/create-report.dto';
import { ReviewContributionReportDto } from './dto/review-report.dto';

@ApiTags('Contribution Reports')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'contribution-reports', version: '1' })
export class ContributionReportsController {
  constructor(private readonly service: ContributionReportsService) {}

  @Post()
  create(@Body() dto: CreateContributionReportDto, @Request() req) {
    return this.service.create(dto, req.user.id);
  }

  @Get('admin/pending')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  findPending() {
    return this.service.findPending();
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  findAll() {
    return this.service.findAll();
  }

  @Patch('admin/:id/review')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  review(
    @Param('id') id: string,
    @Body() dto: ReviewContributionReportDto,
    @Request() req,
  ) {
    return this.service.review(id, dto, req.user.id);
  }
}
