import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TrackSuggestionsService } from './track-suggestions.service';
import { CreateTrackSuggestionDto } from './dto/create-track-suggestion.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TrackSuggestion } from './domain/track-suggestion';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllTrackSuggestionsDto } from './dto/find-all-track-suggestions.dto';

@ApiTags('Tracksuggestions')
@ApiBearerAuth()
@Controller({
  path: 'track-suggestions',
  version: '1',
})
export class TrackSuggestionsController {
  constructor(
    private readonly trackSuggestionsService: TrackSuggestionsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({
    type: TrackSuggestion,
  })
  create(@Body() dto: CreateTrackSuggestionDto, @Request() req) {
    return this.trackSuggestionsService.create(dto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiOkResponse({
    type: InfinityPaginationResponse(TrackSuggestion),
  })
  async findAll(
    @Query() query: FindAllTrackSuggestionsDto,
  ): Promise<InfinityPaginationResponseDto<TrackSuggestion>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 20;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.trackSuggestionsService.findAllWithPagination({
        status: query?.status,
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Patch(':id/review')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: TrackSuggestion,
  })
  markReviewed(@Param('id') id: string, @Request() req) {
    return this.trackSuggestionsService.markReviewed(id, req.user.id);
  }
}
