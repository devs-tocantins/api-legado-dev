import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateContributionReportDto {
  @ApiProperty()
  @IsUUID()
  submissionId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proofUrl?: string;
}
