import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
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
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllLearningTracksDto } from './dto/find-all-learning-tracks.dto';

@ApiTags('Learningtracks')
@ApiBearerAuth()
@Controller({
  path: 'learning-tracks',
  version: '1',
})
export class LearningTracksController {
  constructor(private readonly learningTracksService: LearningTracksService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiCreatedResponse({
    type: LearningTrack,
  })
  create(@Body() createLearningTrackDto: CreateLearningTrackDto) {
    return this.learningTracksService.create(createLearningTrackDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
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

  @Get(':id/overview')
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  getOverview(@Param('id') id: string) {
    return this.learningTracksService.getOverview(id);
  }

  @Get(':id/progress')
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  getProgress(@Param('id') id: string, @Request() req) {
    return this.learningTracksService.getProgress(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.learningTracksService.remove(id);
  }
}
