import { Module } from '@nestjs/common';
import { GamificationProfilesModule } from '../gamification-profiles/gamification-profiles.module';
import { CourseReviewsService } from './course-reviews.service';
import { CourseReviewsController } from './course-reviews.controller';
import { RelationalCourseReviewPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    GamificationProfilesModule,
    RelationalCourseReviewPersistenceModule,
  ],
  controllers: [CourseReviewsController],
  providers: [CourseReviewsService],
  exports: [CourseReviewsService, RelationalCourseReviewPersistenceModule],
})
export class CourseReviewsModule {}
