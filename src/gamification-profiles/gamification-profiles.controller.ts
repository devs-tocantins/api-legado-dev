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
import { GamificationProfilesService } from './gamification-profiles.service';
import { CreateGamificationProfileDto } from './dto/create-gamification-profile.dto';
import { UpdateGamificationProfileDto } from './dto/update-gamification-profile.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GamificationProfile } from './domain/gamification-profile';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllGamificationProfilesDto } from './dto/find-all-gamification-profiles.dto';

@ApiTags('Gamificationprofiles')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'gamification-profiles',
  version: '1',
})
export class GamificationProfilesController {
  constructor(
    private readonly gamificationProfilesService: GamificationProfilesService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    type: GamificationProfile,
  })
  create(@Body() createGamificationProfileDto: CreateGamificationProfileDto) {
    return this.gamificationProfilesService.create(
      createGamificationProfileDto,
    );
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
    type: GamificationProfile,
  })
  findById(@Param('id') id: string) {
    return this.gamificationProfilesService.findById(id);
  }

  @Patch(':id')
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

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.gamificationProfilesService.remove(id);
  }
}
