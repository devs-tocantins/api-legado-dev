import { Module } from '@nestjs/common';
import { TrackSectionRepository } from '../track-section.repository';
import { TrackSectionRelationalRepository } from './repositories/track-section.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackSectionEntity } from './entities/track-section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrackSectionEntity])],
  providers: [
    {
      provide: TrackSectionRepository,
      useClass: TrackSectionRelationalRepository,
    },
  ],
  exports: [TrackSectionRepository],
})
export class RelationalTrackSectionPersistenceModule {}
