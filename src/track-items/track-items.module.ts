import { Module } from '@nestjs/common';
import { TrackItemsService } from './track-items.service';
import { TrackItemsController } from './track-items.controller';
import { RelationalTrackItemPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalTrackItemPersistenceModule],
  controllers: [TrackItemsController],
  providers: [TrackItemsService],
  exports: [TrackItemsService, RelationalTrackItemPersistenceModule],
})
export class TrackItemsModule {}
