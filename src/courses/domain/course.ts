import { ApiProperty } from '@nestjs/swagger';
import { CourseStatus } from './course-status.enum';

export class Course {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String, nullable: true })
  provider: string | null;

  @ApiProperty({ type: String })
  url: string;

  @ApiProperty({ type: Boolean })
  isFree: boolean;

  @ApiProperty({ type: Number, nullable: true })
  price: number | null;

  @ApiProperty({ type: String, nullable: true })
  language: string | null;

  @ApiProperty({ type: String, nullable: true })
  submittedByProfileId: string | null;

  @ApiProperty({ enum: CourseStatus })
  status: CourseStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
