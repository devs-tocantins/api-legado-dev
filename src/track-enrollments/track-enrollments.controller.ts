import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TrackEnrollmentsService } from './track-enrollments.service';
import { CreateTrackEnrollmentDto } from './dto/create-track-enrollment.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TrackEnrollment } from './domain/track-enrollment';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllTrackEnrollmentsDto } from './dto/find-all-track-enrollments.dto';

@ApiTags('Trackenrollments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'track-enrollments',
  version: '1',
})
export class TrackEnrollmentsController {
  constructor(
    private readonly trackEnrollmentsService: TrackEnrollmentsService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    type: TrackEnrollment,
  })
  create(
    @Body() createTrackEnrollmentDto: CreateTrackEnrollmentDto,
    @Request() req,
  ) {
    return this.trackEnrollmentsService.create(
      createTrackEnrollmentDto,
      req.user.id,
    );
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(TrackEnrollment),
  })
  async findAll(
    @Query() query: FindAllTrackEnrollmentsDto,
  ): Promise<InfinityPaginationResponseDto<TrackEnrollment>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.trackEnrollmentsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
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
    type: TrackEnrollment,
  })
  findById(@Param('id') id: string) {
    return this.trackEnrollmentsService.findById(id);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.trackEnrollmentsService.remove(id);
  }
}
