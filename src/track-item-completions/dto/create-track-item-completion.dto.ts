import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { TrackItemCompletionStatus } from '../domain/track-item-completion-status.enum';

export class CreateTrackItemCompletionDto {
  @ApiProperty()
  @IsUUID()
  itemId: string;

  @ApiProperty()
  @IsUUID()
  profileId: string;

  @ApiPropertyOptional({ enum: TrackItemCompletionStatus })
  @IsOptional()
  @IsEnum(TrackItemCompletionStatus)
  status?: TrackItemCompletionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  submissionId?: string | null;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  awardedJourneyXp?: number;
}
