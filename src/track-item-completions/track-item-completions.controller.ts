import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { TrackItemCompletionsService } from './track-item-completions.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TrackItemCompletion } from './domain/track-item-completion';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllTrackItemCompletionsDto } from './dto/find-all-track-item-completions.dto';

@ApiTags('Trackitemcompletions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'track-item-completions',
  version: '1',
})
export class TrackItemCompletionsController {
  constructor(
    private readonly trackItemCompletionsService: TrackItemCompletionsService,
  ) {}

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(TrackItemCompletion),
  })
  async findAll(
    @Query() query: FindAllTrackItemCompletionsDto,
  ): Promise<InfinityPaginationResponseDto<TrackItemCompletion>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.trackItemCompletionsService.findAllWithPagination({
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
    type: TrackItemCompletion,
  })
  findById(@Param('id') id: string) {
    return this.trackItemCompletionsService.findById(id);
  }
}
