import { Module } from '@nestjs/common';
import { LearningTracksService } from './learning-tracks.service';
import { LearningTracksController } from './learning-tracks.controller';
import { RelationalLearningTrackPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalLearningTrackPersistenceModule],
  controllers: [LearningTracksController],
  providers: [LearningTracksService],
  exports: [LearningTracksService, RelationalLearningTrackPersistenceModule],
})
export class LearningTracksModule {}
