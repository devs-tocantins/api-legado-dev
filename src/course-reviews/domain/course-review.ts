import { ApiProperty } from '@nestjs/swagger';

export class CourseReview {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  courseId: string;

  @ApiProperty({ type: String })
  profileId: string;

  @ApiProperty({ type: Number, minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty({ type: String, nullable: true })
  comment: string | null;

  @ApiProperty({
    type: Boolean,
    description: 'Se true, o autor comprovou a conclusão do curso',
  })
  provenCompletion: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
