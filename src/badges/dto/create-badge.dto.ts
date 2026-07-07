import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { BadgeCriteriaTypeEnum } from '../domain/badge-criteria-type.enum';
import { BadgeCategoryEnum } from '../domain/badge-category.enum';

export class CreateBadgeDto {
  @ApiProperty({ example: 'Primeira Missão' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Tenha sua primeira submissão aprovada.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/badge.png' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ enum: BadgeCategoryEnum })
  @IsEnum(BadgeCategoryEnum)
  category: BadgeCategoryEnum;

  @ApiProperty({ enum: BadgeCriteriaTypeEnum })
  @IsEnum(BadgeCriteriaTypeEnum)
  criteriaType: BadgeCriteriaTypeEnum;

  @ApiPropertyOptional({
    example: { type: 'submissions_approved', threshold: 1 },
    description: 'Obrigatório para badges AUTOMATIC',
  })
  @ValidateIf((o) => o.criteriaType === BadgeCriteriaTypeEnum.AUTOMATIC)
  @IsObject()
  criteriaConfig?: Record<string, unknown>;
}
