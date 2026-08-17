import { Module } from '@nestjs/common';
import { TrackItemCompletionsService } from './track-item-completions.service';
import { TrackItemCompletionsController } from './track-item-completions.controller';
import { RelationalTrackItemCompletionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalTrackItemCompletionPersistenceModule],
  controllers: [TrackItemCompletionsController],
  providers: [TrackItemCompletionsService],
  exports: [
    TrackItemCompletionsService,
    RelationalTrackItemCompletionPersistenceModule,
  ],
})
export class TrackItemCompletionsModule {}
