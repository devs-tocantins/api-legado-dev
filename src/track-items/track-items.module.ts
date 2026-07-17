import { Module } from '@nestjs/common';
import { TrackItemsService } from './track-items.service';
import { TrackItemsController } from './track-items.controller';
import { RelationalTrackItemPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { TrackItemCompletionsModule } from '../track-item-completions/track-item-completions.module';
import { GamificationProfilesModule } from '../gamification-profiles/gamification-profiles.module';

@Module({
  imports: [
    RelationalTrackItemPersistenceModule,
    TrackItemCompletionsModule,
    GamificationProfilesModule,
  ],
  controllers: [TrackItemsController],
  providers: [TrackItemsService],
  exports: [TrackItemsService, RelationalTrackItemPersistenceModule],
})
export class TrackItemsModule {}
