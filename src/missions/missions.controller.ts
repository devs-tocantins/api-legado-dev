import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { MissionsService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { SubmitMissionDto } from './dto/submit-mission.dto';
import { ReviewMissionSubmissionDto } from './dto/review-mission-submission.dto';
import { Mission } from './domain/mission';
import { MissionSubmission } from './domain/mission-submission';

@ApiTags('Missions')
@Controller({ path: 'missions', version: '1' })
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  // ── Public ───────────────────────────────────────────────────────────────────

  @Get()
  @ApiOkResponse({ type: [Mission] })
  findOpen() {
    return this.missionsService.findOpen();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: Mission })
  findOne(@Param('id') id: string) {
    return this.missionsService.findById(id);
  }

  // ── Authenticated user ────────────────────────────────────────────────────────

  @Post(':id/submit')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: String })
  @ApiCreatedResponse({ type: MissionSubmission })
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitMissionDto,
    @Request() req,
  ) {
    return this.missionsService.submit(id, req.user.id, dto);
  }

  @Get(':id/my-submission')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: MissionSubmission })
  mySubmission(@Param('id') id: string, @Request() req) {
    return this.missionsService.findMySubmission(id, req.user.id);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiCreatedResponse({ type: Mission })
  create(@Body() dto: CreateMissionDto) {
    return this.missionsService.create(dto);
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiOkResponse({ type: [Mission] })
  findAll() {
    return this.missionsService.findAll();
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: Mission })
  update(@Param('id') id: string, @Body() dto: CreateMissionDto) {
    return this.missionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string) {
    return this.missionsService.remove(id);
  }

  @Get(':id/submissions')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: [MissionSubmission] })
  listSubmissions(@Param('id') id: string) {
    return this.missionsService.findSubmissions(id);
  }

  @Patch(':id/submissions/:submissionId/review')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'submissionId', type: String })
  @ApiOkResponse({ type: MissionSubmission })
  reviewSubmission(
    @Param('id') id: string,
    @Param('submissionId') submissionId: string,
    @Body() dto: ReviewMissionSubmissionDto,
    @Request() req,
  ) {
    return this.missionsService.reviewSubmission(
      id,
      submissionId,
      dto,
      req.user.id,
    );
  }
}
