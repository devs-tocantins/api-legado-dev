import { ApiProperty } from '@nestjs/swagger';
import { RankingPeriodType } from './ranking-period-type.enum';
import { GamificationProfile } from '../../gamification-profiles/domain/gamification-profile';

export class RankingSnapshot {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  profileId: string;

  @ApiProperty({ enum: RankingPeriodType })
  periodType: RankingPeriodType;

  @ApiProperty({ type: String, example: '2026-07' })
  periodKey: string;

  @ApiProperty({ type: Number })
  position: number;

  @ApiProperty({ type: Number })
  xpAtSnapshot: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    type: () => GamificationProfile,
    required: false,
    nullable: true,
  })
  profile?: GamificationProfile | null;
}
