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
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';
import { RedeemSecretCodeDto } from './dto/redeem-secret-code.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Submission } from './domain/submission';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllSubmissionsDto } from './dto/find-all-submissions.dto';

@ApiTags('Submissions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'submissions',
  version: '1',
})
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @ApiCreatedResponse({
    type: Submission,
  })
  create(@Body() createSubmissionDto: CreateSubmissionDto, @Request() req) {
    return this.submissionsService.create(createSubmissionDto, req.user.id);
  }

  @Post('redeem')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: Submission,
    description: 'Resgata um código secreto de atividade oculta',
  })
  redeemSecretCode(@Body() dto: RedeemSecretCodeDto, @Request() req) {
    return this.submissionsService.redeemSecretCode(dto, req.user.id);
  }

  @Get('me')
  @ApiOkResponse({
    type: InfinityPaginationResponse(Submission),
  })
  async findMine(
    @Query() query: FindAllSubmissionsDto,
    @Request() req,
  ): Promise<InfinityPaginationResponseDto<Submission>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.submissionsService.findMySubmissions(req.user.id, {
        page,
        limit,
      }),
      { page, limit },
    );
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiOkResponse({
    type: InfinityPaginationResponse(Submission),
  })
  async findPending(
    @Query() query: FindAllSubmissionsDto,
  ): Promise<InfinityPaginationResponseDto<Submission>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.submissionsService.findPending({ page, limit }),
      { page, limit },
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiOkResponse({
    type: InfinityPaginationResponse(Submission),
  })
  async findAll(
    @Query() query: FindAllSubmissionsDto,
  ): Promise<InfinityPaginationResponseDto<Submission>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.submissionsService.findAllWithPagination({
        paginationOptions: { page, limit },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Submission,
  })
  findById(@Param('id') id: string) {
    return this.submissionsService.findById(id);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Submission,
  })
  review(
    @Param('id') id: string,
    @Body() reviewDto: ReviewSubmissionDto,
    @Request() req,
  ) {
    return this.submissionsService.review(id, reviewDto, req.user.id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Submission,
  })
  update(
    @Param('id') id: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
  ) {
    return this.submissionsService.update(id, updateSubmissionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.submissionsService.remove(id);
  }
}
