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
} from '@nestjs/common';
import { TrackSectionsService } from './track-sections.service';
import { CreateTrackSectionDto } from './dto/create-track-section.dto';
import { UpdateTrackSectionDto } from './dto/update-track-section.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TrackSection } from './domain/track-section';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllTrackSectionsDto } from './dto/find-all-track-sections.dto';

@ApiTags('Tracksections')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'track-sections',
  version: '1',
})
export class TrackSectionsController {
  constructor(private readonly trackSectionsService: TrackSectionsService) {}

  @Post()
  @ApiCreatedResponse({
    type: TrackSection,
  })
  create(@Body() createTrackSectionDto: CreateTrackSectionDto) {
    return this.trackSectionsService.create(createTrackSectionDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(TrackSection),
  })
  async findAll(
    @Query() query: FindAllTrackSectionsDto,
  ): Promise<InfinityPaginationResponseDto<TrackSection>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.trackSectionsService.findAllWithPagination({
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
    type: TrackSection,
  })
  findById(@Param('id') id: string) {
    return this.trackSectionsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: TrackSection,
  })
  update(
    @Param('id') id: string,
    @Body() updateTrackSectionDto: UpdateTrackSectionDto,
  ) {
    return this.trackSectionsService.update(id, updateTrackSectionDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.trackSectionsService.remove(id);
  }
}
