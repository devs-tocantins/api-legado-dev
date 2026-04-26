import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMissionDto {
  @ApiProperty({ example: 'Primeiro PR aprovado no repositório oficial' })
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim() ?? null)
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Critérios que o admin vai usar para avaliar',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() ?? null)
  requirements?: string | null;

  @ApiProperty({ example: 500 })
  @IsInt()
  @Min(1)
  xpReward: number;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  participationReward: number;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(0)
  auditorReward: number;

  @ApiPropertyOptional({
    default: false,
    description: 'Se true, não aparece na listagem pública',
  })
  @IsOptional()
  @IsBoolean()
  isSecret?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  requiresProof?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  requiresDescription?: boolean;
}
