import { ApiProperty } from '@nestjs/swagger';
import { MissionSubmissionStatus } from './mission-submission-status.enum';

export class MissionSubmission {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  missionId: string;

  @ApiProperty({ type: String })
  profileId: string;

  @ApiProperty({ type: String, nullable: true })
  proofUrl: string | null;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ enum: MissionSubmissionStatus })
  status: MissionSubmissionStatus;

  @ApiProperty({ type: String, nullable: true })
  feedback: string | null;

  @ApiProperty({ type: Number })
  awardedXp: number;

  @ApiProperty({ type: Number, nullable: true })
  reviewerId: number | null;

  @ApiProperty({ nullable: true })
  reviewedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
