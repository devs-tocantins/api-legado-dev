import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { RankingSnapshotsService } from './ranking-snapshots.service';
import { QueryChampionDto } from './dto/query-champion.dto';
import { RankingSnapshot } from './domain/ranking-snapshot';

@ApiTags('Ranking Snapshots')
@Controller({
  path: 'ranking-snapshots',
  version: '1',
})
export class RankingSnapshotsController {
  constructor(
    private readonly rankingSnapshotsService: RankingSnapshotsService,
  ) {}

  @Get('champion')
  @ApiOkResponse({
    type: RankingSnapshot,
    description: 'Retorna o campeão (posição 1) do último período fechado',
  })
  getChampion(@Query() query: QueryChampionDto) {
    return this.rankingSnapshotsService.getChampion(query.type ?? 'monthly');
  }

  @Get('profile/:profileId')
  @ApiParam({
    name: 'profileId',
    type: String,
    required: true,
    description: 'ID do perfil de gamificação (UUID)',
  })
  @ApiOkResponse({
    type: [RankingSnapshot],
    description: 'Retorna o histórico de posições do perfil',
  })
  getProfileHistory(@Param('profileId') profileId: string) {
    return this.rankingSnapshotsService.getProfileHistory(profileId);
  }
}
