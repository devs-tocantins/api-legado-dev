import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateActivityDto {
  @ApiProperty({ example: 'Artigo Publicado' })
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiProperty({ example: 'Publicou um artigo técnico em blog reconhecido' })
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => value?.trim())
  description: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  fixedReward: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiProperty({ example: 'meetup-outubro-2026', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim() ?? null)
  secretCode?: string | null;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  requiresProof?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  requiresDescription?: boolean;

  @ApiProperty({ example: 24, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  cooldownHours?: number;
}
