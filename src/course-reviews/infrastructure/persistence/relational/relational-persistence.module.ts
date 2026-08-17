import { Module } from '@nestjs/common';
import { CourseReviewRepository } from '../course-review.repository';
import { CourseReviewRelationalRepository } from './repositories/course-review.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseReviewEntity } from './entities/course-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseReviewEntity])],
  providers: [
    {
      provide: CourseReviewRepository,
      useClass: CourseReviewRelationalRepository,
    },
  ],
  exports: [CourseReviewRepository],
})
export class RelationalCourseReviewPersistenceModule {}
