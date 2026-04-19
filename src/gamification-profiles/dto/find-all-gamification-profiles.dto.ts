import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GamificationProfileSortDto {
  @ApiPropertyOptional({
    enum: [
      'totalXp',
      'currentMonthlyXp',
      'currentYearlyXp',
      'gratitudeTokens',
      'createdAt',
    ],
  })
  @IsString()
  @IsIn([
    'totalXp',
    'currentMonthlyXp',
    'currentYearlyXp',
    'gratitudeTokens',
    'createdAt',
  ])
  orderBy: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC';
}

export class FindAllGamificationProfilesDto {
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

  @ApiPropertyOptional({
    description: 'Filter profiles by username (case-insensitive partial match)',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    type: [GamificationProfileSortDto],
    description:
      'Sort by field. Example: [{"orderBy":"totalXp","order":"DESC"}]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @ValidateNested({ each: true })
  @Type(() => GamificationProfileSortDto)
  sort?: GamificationProfileSortDto[];
}
