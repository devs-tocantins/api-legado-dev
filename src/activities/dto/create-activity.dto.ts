import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EffortTier } from '../domain/effort-tier';

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

  @ApiPropertyOptional({
    type: [EffortTier],
    description:
      'Faixas de esforço (Pequeno/Médio/Grande/Épico). Se informado, o usuário declara a faixa na submissão em vez de usar fixedReward.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EffortTier)
  effortTiers?: EffortTier[] | null;

  @ApiPropertyOptional({
    example: false,
    description:
      'Marca a atividade-semente de registro livre ("Registrar outra atividade")',
  })
  @IsOptional()
  @IsBoolean()
  isFreeform?: boolean;
}
