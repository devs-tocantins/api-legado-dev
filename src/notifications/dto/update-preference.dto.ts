import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailOnSubmissionApproved?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailOnMissionWon?: boolean;
}
