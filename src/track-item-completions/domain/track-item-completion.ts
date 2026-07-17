import { ApiProperty } from '@nestjs/swagger';
import { TrackItemCompletionStatus } from './track-item-completion-status.enum';

export class TrackItemCompletion {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  itemId: string;

  @ApiProperty({ type: String })
  profileId: string;

  @ApiProperty({ enum: TrackItemCompletionStatus })
  status: TrackItemCompletionStatus;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Submissão vinculada, quando a prova passou pela moderação',
  })
  submissionId: string | null;

  @ApiProperty({ type: Number, default: 0 })
  awardedJourneyXp: number;

  @ApiProperty()
  completedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
