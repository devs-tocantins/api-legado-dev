import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { MissionSubmissionStatus } from '../domain/mission-submission-status.enum';

export class ReviewMissionSubmissionDto {
  @ApiProperty({
    enum: [MissionSubmissionStatus.APPROVED, MissionSubmissionStatus.REJECTED],
  })
  @IsEnum([MissionSubmissionStatus.APPROVED, MissionSubmissionStatus.REJECTED])
  status: MissionSubmissionStatus.APPROVED | MissionSubmissionStatus.REJECTED;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  feedback?: string;
}
