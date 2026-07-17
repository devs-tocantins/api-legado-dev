import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TrackSectionStatus } from '../domain/track-section-status.enum';

export class CreateTrackSectionDto {
  @ApiProperty()
  @IsUUID()
  trackId: string;

  @ApiProperty({ example: 'Fundamentos' })
  @IsString()
  @MaxLength(160)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    description: 'Índice fracionário de ordenação dentro da trilha',
  })
  @IsNumber()
  position: number;

  @ApiPropertyOptional({ enum: TrackSectionStatus })
  @IsOptional()
  @IsEnum(TrackSectionStatus)
  status?: TrackSectionStatus;

  @ApiPropertyOptional({
    description: 'Selo/badge concedido ao concluir esta etapa',
  })
  @IsOptional()
  @IsUUID()
  badgeId?: string | null;
}
