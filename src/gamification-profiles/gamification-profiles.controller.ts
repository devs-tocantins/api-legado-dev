import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GamificationProfilesService } from './gamification-profiles.service';
import { CreateGamificationProfileDto } from './dto/create-gamification-profile.dto';
import { UpdateGamificationProfileDto } from './dto/update-gamification-profile.dto';
import { TransferTokensDto } from './dto/transfer-tokens.dto';
import { ApplyPenaltyDto } from './dto/apply-penalty.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GamificationProfile } from './domain/gamification-profile';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllGamificationProfilesDto } from './dto/find-all-gamification-profiles.dto';
import { UpdateMyGamificationProfileDto } from './dto/update-my-gamification-profile.dto';
import { SubmissionRepository } from '../submissions/infrastructure/persistence/submission.repository';
import { Submission } from '../submissions/domain/submission';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CourseReviewEntity } from '../course-reviews/infrastructure/persistence/relational/entities/course-review.entity';

@ApiTags('Gamification Profiles')
@Controller({
  path: 'gamification-profiles',
  version: '1',
})
export class GamificationProfilesController {
  constructor(
    private readonly gamificationProfilesService: GamificationProfilesService,
    private readonly submissionRepository: SubmissionRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiCreatedResponse({
    type: GamificationProfile,
  })
  create(@Body() createGamificationProfileDto: CreateGamificationProfileDto) {
    return this.gamificationProfilesService.create(
      createGamificationProfileDto,
    );
  }

  @Post('transfer')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: GamificationProfile,
    description:
      'Retorna o perfil atualizado do remetente após a transferência',
  })
  transfer(@Body() dto: TransferTokensDto, @Request() req) {
    return this.gamificationProfilesService.transferTokens(req.user.id, dto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(GamificationProfile),
  })
  async findAll(
    @Query() query: FindAllGamificationProfilesDto,
  ): Promise<InfinityPaginationResponseDto<GamificationProfile>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.gamificationProfilesService.findAllWithPagination({
        paginationOptions: { page, limit },
        sort: query?.sort,
        search: query?.search,
      }),
      { page, limit },
    );
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: GamificationProfile,
  })
  findMe(@Request() req) {
    return this.gamificationProfilesService.findByUserId(req.user.id);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: GamificationProfile,
  })
  updateMe(@Body() dto: UpdateMyGamificationProfileDto, @Request() req) {
    return this.gamificationProfilesService.updateMyProfile(
      req.user.id,
      dto.username,
      dto.githubUsername,
      dto.bannerPreset,
      dto.avatarConfig,
      dto.showFullName,
    );
  }

  @Get('check-username/:username')
  @ApiParam({
    name: 'username',
    type: String,
    required: true,
    description: 'Username a verificar. Retorna { available: boolean }.',
  })
  @ApiOkResponse({ schema: { example: { available: true } } })
  async checkUsername(
    @Param('username') username: string,
  ): Promise<{ available: boolean }> {
    const existing =
      await this.gamificationProfilesService.findByUsername(username);
    return { available: !existing };
  }

  @Get('by-username/:username')
  @ApiParam({
    name: 'username',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: GamificationProfile,
  })
  findByUsername(@Param('username') username: string) {
    return this.gamificationProfilesService.findByUsername(username);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: GamificationProfile,
  })
  findById(@Param('id') id: string) {
    return this.gamificationProfilesService.findById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: GamificationProfile,
  })
  update(
    @Param('id') id: string,
    @Body() updateGamificationProfileDto: UpdateGamificationProfileDto,
  ) {
    return this.gamificationProfilesService.update(
      id,
      updateGamificationProfileDto,
    );
  }

  @Get(':id/approved-submissions')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: InfinityPaginationResponse(Submission),
  })
  async findApprovedSubmissions(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<InfinityPaginationResponseDto<Submission>> {
    const safeLimit = Math.min(Number(limit), 50);
    return infinityPagination(
      await this.submissionRepository.findApprovedByProfileId(id, {
        page: Number(page),
        limit: safeLimit,
      }),
      { page: Number(page), limit: safeLimit },
    );
  }

  // Feed enxuto de avaliações de curso feitas pelo perfil, pra timeline
  // pública mostrar como categoria própria e discreta ("avaliou o curso X").
  // Consulta direto via DataSource (padrão já usado em profile-portfolio)
  // pra não criar uma dependência de módulo circular com CourseReviewsModule
  // (que já depende de GamificationProfilesModule).
  @Get(':id/course-reviews')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  async findCourseReviews(@Param('id') id: string) {
    const rows = await this.dataSource
      .getRepository(CourseReviewEntity)
      .createQueryBuilder('review')
      .innerJoin('review.course', 'course')
      .select([
        'review.id AS id',
        'review.courseId AS "courseId"',
        'course.title AS "courseTitle"',
        'review.rating AS rating',
        'review.createdAt AS "createdAt"',
      ])
      .where('review.profileId = :id', { id })
      .orderBy('review.createdAt', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      id: r.id,
      courseId: r.courseId,
      courseTitle: r.courseTitle,
      rating: Number(r.rating),
      createdAt: r.createdAt,
    }));
  }

  @Post(':id/penalty')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'ID do perfil de gamificação a ser penalizado',
  })
  @ApiOkResponse({
    type: GamificationProfile,
    description: 'Perfil atualizado após a penalidade',
  })
  async applyPenalty(
    @Param('id') id: string,
    @Body() dto: ApplyPenaltyDto,
    @Request() req,
  ) {
    return this.gamificationProfilesService.applyPenalty(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.gamificationProfilesService.remove(id);
  }
}
