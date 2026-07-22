import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { RankingPeriodType } from '../domain/ranking-period-type.enum';

export class QueryChampionDto {
  @ApiPropertyOptional({
    enum: RankingPeriodType,
    default: RankingPeriodType.MONTHLY,
    description: 'Tipo de período do ranking (monthly ou annual)',
  })
  @IsOptional()
  @IsEnum(RankingPeriodType)
  type?: RankingPeriodType = RankingPeriodType.MONTHLY;
}
