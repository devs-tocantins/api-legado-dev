import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { RelationalSubmissionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { GamificationProfilesModule } from '../gamification-profiles/gamification-profiles.module';
import { ActivitiesModule } from '../activities/activities.module';
import { BadgesModule } from '../badges/badges.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalSubmissionPersistenceModule,
    GamificationProfilesModule,
    ActivitiesModule,
    BadgesModule,
    NotificationsModule,
    FilesModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService, RelationalSubmissionPersistenceModule],
})
export class SubmissionsModule {}
