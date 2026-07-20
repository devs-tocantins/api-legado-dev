import { Module } from '@nestjs/common';
import { GamificationProfilesModule } from '../gamification-profiles/gamification-profiles.module';
import { LearningTracksModule } from '../learning-tracks/learning-tracks.module';
import { TrackSuggestionsService } from './track-suggestions.service';
import { TrackSuggestionsController } from './track-suggestions.controller';
import { RelationalTrackSuggestionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    GamificationProfilesModule,
    LearningTracksModule,
    RelationalTrackSuggestionPersistenceModule,
  ],
  controllers: [TrackSuggestionsController],
  providers: [TrackSuggestionsService],
  exports: [
    TrackSuggestionsService,
    RelationalTrackSuggestionPersistenceModule,
  ],
})
export class TrackSuggestionsModule {}
