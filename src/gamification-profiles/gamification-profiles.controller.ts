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

@ApiTags('Gamification Profiles')
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
  @UseGuards(RolesGuard)
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
  @UseGuards(RolesGuard)
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
