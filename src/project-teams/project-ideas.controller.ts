import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
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
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import {
  ProjectIdea,
  ProjectIdeaInterest,
  SuggestedVacancy,
} from './domain/project-idea';
import { CreateProjectIdeaDto } from './dto/create-project-idea.dto';
import { FindProjectsDto } from './dto/find-projects.dto';
import { ReviewProjectIdeaDto } from './dto/review-project-idea.dto';
import { SetProjectInterestDto } from './dto/set-project-interest.dto';
import { UpdateProjectIdeaDto } from './dto/update-project-idea.dto';
import { ProjectIdeasService } from './project-ideas.service';

function canManageAny(req): boolean {
  const roleId = Number(req.user?.role?.id);
  return roleId === RoleEnum.admin || roleId === RoleEnum.moderator;
}

function pagination(query: FindProjectsDto) {
  const page = query?.page ?? 1;
  const limit = Math.min(query?.limit ?? 10, 50);
  return { page, limit };
}

@ApiTags('Project ideas')
@Controller({ path: 'project-ideas', version: '1' })
export class ProjectIdeasController {
  constructor(private readonly ideasService: ProjectIdeasService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({ type: ProjectIdea })
  create(@Body() dto: CreateProjectIdeaDto, @Request() req) {
    return this.ideasService.create(dto, req.user.id);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(ProjectIdea),
    description: 'Ideias aprovadas, abertas a interessados.',
  })
  async findAll(
    @Query() query: FindProjectsDto,
  ): Promise<InfinityPaginationResponseDto<ProjectIdea>> {
    const options = pagination(query);
    return infinityPagination(
      await this.ideasService.findPublic(options),
      options,
    );
  }

  @Get('mine')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: InfinityPaginationResponse(ProjectIdea) })
  async findMine(
    @Query() query: FindProjectsDto,
    @Request() req,
  ): Promise<InfinityPaginationResponseDto<ProjectIdea>> {
    const options = pagination(query);
    return infinityPagination(
      await this.ideasService.findMine(req.user.id, options),
      options,
    );
  }

  @Get('pending')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiOkResponse({ type: InfinityPaginationResponse(ProjectIdea) })
  async findPending(
    @Query() query: FindProjectsDto,
  ): Promise<InfinityPaginationResponseDto<ProjectIdea>> {
    const options = pagination(query);
    return infinityPagination(
      await this.ideasService.findPending(options),
      options,
    );
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: ProjectIdea })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.ideasService.findPublicDetail(id);
  }

  @Get(':id/manage')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({
    type: ProjectIdea,
    description: 'Detalhe em qualquer status, só para o autor ou moderação.',
  })
  findForManagement(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.ideasService.findForManagement(
      id,
      req.user.id,
      canManageAny(req),
    );
  }

  @Patch(':id/review')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: ProjectIdea })
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewProjectIdeaDto,
    @Request() req,
  ) {
    return this.ideasService.review(id, dto, req.user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: ProjectIdea })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectIdeaDto,
    @Request() req,
  ) {
    return this.ideasService.update(id, dto, req.user.id, canManageAny(req));
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String, required: true })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.ideasService.remove(id, req.user.id, canManageAny(req));
  }

  @Put(':id/interest')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: ProjectIdeaInterest })
  setInterest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetProjectInterestDto,
    @Request() req,
  ) {
    return this.ideasService.setInterest(id, req.user.id, dto);
  }

  @Delete(':id/interest')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String, required: true })
  removeInterest(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.ideasService.removeInterest(id, req.user.id);
  }

  @Get(':id/interest')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: String, required: true })
  getMyInterest(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.ideasService.getMyInterest(id, req.user.id);
  }

  @Get(':id/interests')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({
    type: [ProjectIdeaInterest],
    description: 'Lista de interessados, visível ao autor da ideia.',
  })
  listInterests(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.ideasService.listInterests(id, req.user.id, canManageAny(req));
  }

  @Get(':id/suggested-vacancies')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({
    type: [SuggestedVacancy],
    description:
      'Vagas sugeridas para o time com base no interesse e no texto da ideia.',
  })
  suggestedVacancies(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.ideasService.suggestVacancies(
      id,
      req.user.id,
      canManageAny(req),
    );
  }
}
