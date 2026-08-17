import { Module } from '@nestjs/common';
import { TrackItemCompletionRepository } from '../track-item-completion.repository';
import { TrackItemCompletionRelationalRepository } from './repositories/track-item-completion.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackItemCompletionEntity } from './entities/track-item-completion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrackItemCompletionEntity])],
  providers: [
    {
      provide: TrackItemCompletionRepository,
      useClass: TrackItemCompletionRelationalRepository,
    },
  ],
  exports: [TrackItemCompletionRepository],
})
export class RelationalTrackItemCompletionPersistenceModule {}
