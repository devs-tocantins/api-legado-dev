import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ReviewContributionReportDto {
  @ApiProperty({ enum: ['DISMISSED', 'UPHELD'] })
  @IsEnum(['DISMISSED', 'UPHELD'])
  status: 'DISMISSED' | 'UPHELD';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminNote?: string;
}
