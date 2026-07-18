import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TrackItemType } from '../domain/track-item-type.enum';
import { TrackItemStatus } from '../domain/track-item-status.enum';

export class CreateTrackItemDto {
  @ApiProperty()
  @IsUUID()
  trackId: string;

  @ApiProperty()
  @IsUUID()
  sectionId: string;

  @ApiProperty({ enum: TrackItemType })
  @IsEnum(TrackItemType)
  type: TrackItemType;

  @ApiProperty({ example: 'Suba uma API REST em produção' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string | null;

  @ApiProperty({
    description: 'Índice fracionário de ordenação dentro da etapa',
  })
  @IsNumber()
  position: number;

  @ApiPropertyOptional({ enum: TrackItemStatus })
  @IsOptional()
  @IsEnum(TrackItemStatus)
  status?: TrackItemStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allowsTestOut?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  journeyXp?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  grantsCommunityXp?: boolean;

  @ApiPropertyOptional({
    default: 0,
    description:
      'XP de Comunidade concedido quando grantsCommunityXp é true. Usado para configurar a atividade exclusiva criada automaticamente para marcos PROOF sem activityId.',
  })
  @IsOptional()
  @IsNumber()
  communityXpReward?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  activityId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  missionId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  courseId?: string | null;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown> | null;
}
