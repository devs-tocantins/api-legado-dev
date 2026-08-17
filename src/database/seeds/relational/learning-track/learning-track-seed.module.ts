import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningTrackSeedService } from './learning-track-seed.service';
import { LearningTrackEntity } from '../../../../learning-tracks/infrastructure/persistence/relational/entities/learning-track.entity';
import { TrackSectionEntity } from '../../../../track-sections/infrastructure/persistence/relational/entities/track-section.entity';
import { TrackItemEntity } from '../../../../track-items/infrastructure/persistence/relational/entities/track-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningTrackEntity,
      TrackSectionEntity,
      TrackItemEntity,
    ]),
  ],
  providers: [LearningTrackSeedService],
  exports: [LearningTrackSeedService],
})
export class LearningTrackSeedModule {}
