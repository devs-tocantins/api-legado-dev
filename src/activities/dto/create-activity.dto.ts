import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({ example: 'Artigo Publicado' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Publicou um artigo técnico em blog reconhecido' })
  @IsString()
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
  secretCode?: string | null;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  requiresProof?: boolean;

  @ApiProperty({ example: 24, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  cooldownHours?: number;
}
