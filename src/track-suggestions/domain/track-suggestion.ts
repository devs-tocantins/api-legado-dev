import { ApiProperty } from '@nestjs/swagger';
import { TrackSuggestionStatusEnum } from './track-suggestion-status.enum';

export class TrackSuggestion {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  profileId: string;

  @ApiProperty({ type: String, nullable: true })
  trackId: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Nome sugerido para uma trilha nova (quando trackId é nulo)',
  })
  title: string | null;

  @ApiProperty({ type: String })
  message: string;

  @ApiProperty({ enum: TrackSuggestionStatusEnum })
  status: TrackSuggestionStatusEnum;

  @ApiProperty({ type: String, nullable: true })
  reviewedByProfileId: string | null;

  @ApiProperty({ nullable: true })
  reviewedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
