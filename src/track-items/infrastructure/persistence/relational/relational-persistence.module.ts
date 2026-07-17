import { Module } from '@nestjs/common';
import { TrackItemRepository } from '../track-item.repository';
import { TrackItemRelationalRepository } from './repositories/track-item.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackItemEntity } from './entities/track-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrackItemEntity])],
  providers: [
    {
      provide: TrackItemRepository,
      useClass: TrackItemRelationalRepository,
    },
  ],
  exports: [TrackItemRepository],
})
export class RelationalTrackItemPersistenceModule {}
