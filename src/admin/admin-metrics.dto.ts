import { ApiProperty } from '@nestjs/swagger';

export class AdminMetricsDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty()
  bannedUsers: number;

  @ApiProperty()
  submissionsPending: number;

  @ApiProperty()
  submissionsApprovedThisMonth: number;

  @ApiProperty()
  submissionsRejectedThisMonth: number;

  @ApiProperty()
  totalXpDistributed: number;

  @ApiProperty()
  tokensInCirculation: number;
}
