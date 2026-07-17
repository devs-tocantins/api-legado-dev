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
import { LearningTracksService } from './learning-tracks.service';
import { CreateLearningTrackDto } from './dto/create-learning-track.dto';
import { UpdateLearningTrackDto } from './dto/update-learning-track.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { LearningTrack } from './domain/learning-track';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllLearningTracksDto } from './dto/find-all-learning-tracks.dto';

@ApiTags('Learningtracks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'learning-tracks',
  version: '1',
})
export class LearningTracksController {
  constructor(private readonly learningTracksService: LearningTracksService) {}

  @Post()
  @ApiCreatedResponse({
    type: LearningTrack,
  })
  create(@Body() createLearningTrackDto: CreateLearningTrackDto) {
    return this.learningTracksService.create(createLearningTrackDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(LearningTrack),
  })
  async findAll(
    @Query() query: FindAllLearningTracksDto,
  ): Promise<InfinityPaginationResponseDto<LearningTrack>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.learningTracksService.findAllWithPagination({
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
    type: LearningTrack,
  })
  findById(@Param('id') id: string) {
    return this.learningTracksService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: LearningTrack,
  })
  update(
    @Param('id') id: string,
    @Body() updateLearningTrackDto: UpdateLearningTrackDto,
  ) {
    return this.learningTracksService.update(id, updateLearningTrackDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.learningTracksService.remove(id);
  }
}
