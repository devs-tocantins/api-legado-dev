import { Module } from '@nestjs/common';
import { GamificationProfilesModule } from '../gamification-profiles/gamification-profiles.module';
import { TrackEnrollmentsService } from './track-enrollments.service';
import { TrackEnrollmentsController } from './track-enrollments.controller';
import { RelationalTrackEnrollmentPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    GamificationProfilesModule,
    RelationalTrackEnrollmentPersistenceModule,
  ],
  controllers: [TrackEnrollmentsController],
  providers: [TrackEnrollmentsService],
  exports: [
    TrackEnrollmentsService,
    RelationalTrackEnrollmentPersistenceModule,
  ],
})
export class TrackEnrollmentsModule {}
