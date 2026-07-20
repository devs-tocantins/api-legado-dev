import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { TrackSuggestionStatusEnum } from '../domain/track-suggestion-status.enum';

export class FindAllTrackSuggestionsDto {
  @ApiPropertyOptional({ enum: TrackSuggestionStatusEnum })
  @IsOptional()
  @IsEnum(TrackSuggestionStatusEnum)
  status?: TrackSuggestionStatusEnum;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;
}
