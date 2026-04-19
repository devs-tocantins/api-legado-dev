import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Badge } from './badge';

export class GamificationProfileBadge {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  profileId: string;

  @ApiProperty({ type: String })
  badgeId: string;

  @ApiPropertyOptional({ type: () => Badge })
  badge?: Badge;

  @ApiProperty()
  unlockedAt: Date;

  @ApiPropertyOptional({ type: Number, nullable: true })
  grantedBy?: number | null;
}
