import { Module } from '@nestjs/common';
import { LearningTracksService } from './learning-tracks.service';
import { LearningTracksController } from './learning-tracks.controller';
import { RelationalLearningTrackPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { TrackSectionsModule } from '../track-sections/track-sections.module';
import { TrackItemsModule } from '../track-items/track-items.module';
import { TrackEnrollmentsModule } from '../track-enrollments/track-enrollments.module';
import { TrackItemCompletionsModule } from '../track-item-completions/track-item-completions.module';
import { GamificationProfilesModule } from '../gamification-profiles/gamification-profiles.module';

@Module({
  imports: [
    RelationalLearningTrackPersistenceModule,
    TrackSectionsModule,
    TrackItemsModule,
    TrackEnrollmentsModule,
    TrackItemCompletionsModule,
    GamificationProfilesModule,
  ],
  controllers: [LearningTracksController],
  providers: [LearningTracksService],
  exports: [LearningTracksService, RelationalLearningTrackPersistenceModule],
})
export class LearningTracksModule {}
