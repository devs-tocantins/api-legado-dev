import { Module } from '@nestjs/common';
import { TrackSectionsService } from './track-sections.service';
import { TrackSectionsController } from './track-sections.controller';
import { RelationalTrackSectionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalTrackSectionPersistenceModule],
  controllers: [TrackSectionsController],
  providers: [TrackSectionsService],
  exports: [TrackSectionsService, RelationalTrackSectionPersistenceModule],
})
export class TrackSectionsModule {}
