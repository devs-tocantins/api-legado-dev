import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CourseStatus } from '../domain/course-status.enum';

const allowedStatuses = [CourseStatus.VERIFIED, CourseStatus.REJECTED];

export class ReviewCourseDto {
  @ApiProperty({
    enum: allowedStatuses,
    description: 'Decisão do moderador: VERIFIED ou REJECTED',
    example: CourseStatus.VERIFIED,
  })
  @IsEnum(allowedStatuses, {
    message: 'status deve ser VERIFIED ou REJECTED',
  })
  status: CourseStatus.VERIFIED | CourseStatus.REJECTED;
}
