import { ApiProperty } from '@nestjs/swagger';

export class PublicSubmissionDetail {
  @ApiProperty({ type: String })
  activityTitle: string;

  @ApiProperty({ type: String })
  activityDescription: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ type: String, nullable: true })
  activityDate: string | null;

  @ApiProperty({ type: Number })
  awardedXp: number;

  @ApiProperty({ type: Boolean })
  hasProof: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ nullable: true })
  reviewedAt: Date | null;
}
