import { Module } from '@nestjs/common';
import { GamificationProfilesModule } from '../gamification-profiles/gamification-profiles.module';
import { TrackItemsModule } from '../track-items/track-items.module';
import { TrackItemCompletionsModule } from '../track-item-completions/track-item-completions.module';
import { CourseReviewsService } from './course-reviews.service';
import { CourseReviewsController } from './course-reviews.controller';
import { RelationalCourseReviewPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    GamificationProfilesModule,
    TrackItemsModule,
    TrackItemCompletionsModule,
    RelationalCourseReviewPersistenceModule,
  ],
  controllers: [CourseReviewsController],
  providers: [CourseReviewsService],
  exports: [CourseReviewsService, RelationalCourseReviewPersistenceModule],
})
export class CourseReviewsModule {}
