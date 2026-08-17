import { ApiProperty } from '@nestjs/swagger';
import { LearningTrackStatus } from './learning-track-status.enum';
import { LearningTrackTier } from './learning-track-tier.enum';

export class LearningTrack {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String, example: 'backend-inicial' })
  slug: string;

  @ApiProperty({ type: String, example: 'Backend inicial' })
  title: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ type: String, example: 'backend' })
  area: string;

  @ApiProperty({ enum: LearningTrackTier })
  tier: LearningTrackTier;

  @ApiProperty({ enum: LearningTrackStatus })
  status: LearningTrackStatus;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'ID da trilha exigida como pré-requisito, se houver',
  })
  requiresTrackId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
