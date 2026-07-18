import { ApiProperty } from '@nestjs/swagger';
import { LearningTrackTier } from '../../learning-tracks/domain/learning-track-tier.enum';

export class ProofPortfolioItem {
  @ApiProperty({ type: String })
  itemId: string;

  @ApiProperty({ type: String })
  itemTitle: string;

  @ApiProperty({ type: String })
  trackId: string;

  @ApiProperty({ type: String })
  trackTitle: string;

  @ApiProperty({ enum: LearningTrackTier })
  trackTier: LearningTrackTier;

  @ApiProperty({ type: String })
  sectionId: string;

  @ApiProperty({ type: String })
  sectionTitle: string;

  @ApiProperty({ type: Boolean })
  isTestOut: boolean;

  @ApiProperty()
  completedAt: Date;
}
