import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { LearningTrackStatus } from '../domain/learning-track-status.enum';
import { LearningTrackTier } from '../domain/learning-track-tier.enum';

export class CreateLearningTrackDto {
  @ApiProperty({ example: 'backend-inicial' })
  @IsString()
  @MaxLength(120)
  slug: string;

  @ApiProperty({ example: 'Backend inicial' })
  @IsString()
  @MaxLength(160)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: 'backend' })
  @IsString()
  @MaxLength(60)
  area: string;

  @ApiProperty({ enum: LearningTrackTier })
  @IsEnum(LearningTrackTier)
  tier: LearningTrackTier;

  @ApiPropertyOptional({ enum: LearningTrackStatus })
  @IsOptional()
  @IsEnum(LearningTrackStatus)
  status?: LearningTrackStatus;

  @ApiPropertyOptional({
    description: 'ID da trilha exigida como pré-requisito, se houver',
  })
  @IsOptional()
  @IsUUID()
  requiresTrackId?: string | null;
}
