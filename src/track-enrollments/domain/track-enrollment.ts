import { ApiProperty } from '@nestjs/swagger';
import { TrackEnrollmentStatus } from './track-enrollment-status.enum';

export class TrackEnrollment {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  trackId: string;

  @ApiProperty({ type: String })
  profileId: string;

  @ApiProperty({ enum: TrackEnrollmentStatus })
  status: TrackEnrollmentStatus;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ nullable: true })
  completedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
