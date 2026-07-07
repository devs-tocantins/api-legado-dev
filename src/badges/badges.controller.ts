import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BadgesService } from './badges.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { GrantBadgeDto } from './dto/grant-badge.dto';
import { Badge } from './domain/badge';
import { GamificationProfileBadge } from './domain/gamification-profile-badge';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';

@ApiTags('Badges')
@Controller({ path: 'badges', version: '1' })
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  // ── Admin: gerenciar catálogo ────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiCreatedResponse({ type: Badge })
  create(@Body() dto: CreateBadgeDto): Promise<Badge> {
    return this.badgesService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: Badge })
  update(@Param('id') id: string, @Body() dto: UpdateBadgeDto): Promise<Badge> {
    return this.badgesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string): Promise<void> {
    return this.badgesService.remove(id);
  }

  // ── Admin: listagem completa ─────────────────────────────────────────────

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOkResponse({ type: [Badge] })
  findAll(): Promise<Badge[]> {
    return this.badgesService.findAll();
  }

  // ── Admin: conceder badge manual ─────────────────────────────────────────

  @Post('grant')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GamificationProfileBadge })
  grant(
    @Body() dto: GrantBadgeDto,
    @Request() req,
  ): Promise<GamificationProfileBadge> {
    return this.badgesService.grantManual(dto, req.user.id);
  }

  // ── Público: catálogo de badges ativos ──────────────────────────────────

  @Get()
  @ApiOkResponse({ type: [Badge] })
  findAllActive(): Promise<Badge[]> {
    return this.badgesService.findAllActive();
  }

  // ── Público: badges de um perfil ─────────────────────────────────────────

  @Get('profile/:profileId')
  @ApiParam({ name: 'profileId', type: String })
  @ApiOkResponse({ type: [GamificationProfileBadge] })
  findByProfile(
    @Param('profileId') profileId: string,
  ): Promise<GamificationProfileBadge[]> {
    return this.badgesService.findBadgesByProfileId(profileId);
  }
}
