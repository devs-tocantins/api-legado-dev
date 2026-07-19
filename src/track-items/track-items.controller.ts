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
import { TrackItemsService } from './track-items.service';
import { CreateTrackItemDto } from './dto/create-track-item.dto';
import { UpdateTrackItemDto } from './dto/update-track-item.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TrackItem } from './domain/track-item';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllTrackItemsDto } from './dto/find-all-track-items.dto';

@ApiTags('Trackitems')
@ApiBearerAuth()
@Controller({
  path: 'track-items',
  version: '1',
})
export class TrackItemsController {
  constructor(private readonly trackItemsService: TrackItemsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiCreatedResponse({
    type: TrackItem,
  })
  create(@Body() createTrackItemDto: CreateTrackItemDto) {
    return this.trackItemsService.create(createTrackItemDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: InfinityPaginationResponse(TrackItem),
  })
  async findAll(
    @Query() query: FindAllTrackItemsDto,
  ): Promise<InfinityPaginationResponseDto<TrackItem>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.trackItemsService.findAllWithPagination({
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
    type: TrackItem,
  })
  findById(@Param('id') id: string) {
    return this.trackItemsService.findById(id);
  }

  @Post(':id/complete')
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  completeAuto(@Param('id') id: string, @Request() req) {
    return this.trackItemsService.completeAuto(id, req.user.id);
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
    type: TrackItem,
  })
  update(
    @Param('id') id: string,
    @Body() updateTrackItemDto: UpdateTrackItemDto,
  ) {
    return this.trackItemsService.update(id, updateTrackItemDto);
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
    return this.trackItemsService.remove(id);
  }
}
