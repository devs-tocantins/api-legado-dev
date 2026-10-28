import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RoleEnum } from '../roles/roles.enum';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { ProjectTeam } from './domain/project-team';
import { AddProjectTeamMemberDto } from './dto/add-project-team-member.dto';
import { CreateProjectTeamDto } from './dto/create-project-team.dto';
import { FindProjectsDto } from './dto/find-projects.dto';
import { UpdateProjectTeamDto } from './dto/update-project-team.dto';
import { ProjectTeamsService } from './project-teams.service';

function canManageAny(req): boolean {
  const roleId = Number(req.user?.role?.id);
  return roleId === RoleEnum.admin || roleId === RoleEnum.moderator;
}

function pagination(query: FindProjectsDto) {
  const page = query?.page ?? 1;
  const limit = Math.min(query?.limit ?? 10, 50);
  return { page, limit };
}

@ApiTags('Project teams')
@Controller({ path: 'project-teams', version: '1' })
export class ProjectTeamsController {
  constructor(private readonly teamsService: ProjectTeamsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({ type: ProjectTeam })
  create(@Body() dto: CreateProjectTeamDto, @Request() req) {
    return this.teamsService.create(dto, req.user.id);
  }

  @Get()
  @ApiOkResponse({ type: InfinityPaginationResponse(ProjectTeam) })
  async findAll(
    @Query() query: FindProjectsDto,
  ): Promise<InfinityPaginationResponseDto<ProjectTeam>> {
    const options = pagination(query);
    return infinityPagination(
      await this.teamsService.findPublic(options, query?.status),
      options,
    );
  }

  @Get('mine')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: InfinityPaginationResponse(ProjectTeam),
    description: 'Times em que o usuário é dono ou membro.',
  })
  async findMine(
    @Query() query: FindProjectsDto,
    @Request() req,
  ): Promise<InfinityPaginationResponseDto<ProjectTeam>> {
    const options = pagination(query);
    return infinityPagination(
      await this.teamsService.findMine(req.user.id, options),
      options,
    );
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: ProjectTeam })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.findById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: ProjectTeam })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectTeamDto,
    @Request() req,
  ) {
    return this.teamsService.update(id, dto, req.user.id, canManageAny(req));
  }

  @Post(':id/members')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiCreatedResponse({ type: ProjectTeam })
  addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddProjectTeamMemberDto,
    @Request() req,
  ) {
    return this.teamsService.addMember(id, dto, req.user.id, canManageAny(req));
  }

  @Delete(':id/members/:userId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiParam({ name: 'userId', type: Number, required: true })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    return this.teamsService.removeMember(
      id,
      userId,
      req.user.id,
      canManageAny(req),
    );
  }
}
