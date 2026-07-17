import { Module } from '@nestjs/common';
import { LearningTrackRepository } from '../learning-track.repository';
import { LearningTrackRelationalRepository } from './repositories/learning-track.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningTrackEntity } from './entities/learning-track.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningTrackEntity])],
  providers: [
    {
      provide: LearningTrackRepository,
      useClass: LearningTrackRelationalRepository,
    },
  ],
  exports: [LearningTrackRepository],
})
export class RelationalLearningTrackPersistenceModule {}
