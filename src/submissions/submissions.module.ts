import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SubmissionsService } from './submissions.service';
import { SubmissionsCronService } from './submissions-cron.service';
import { SubmissionsController } from './submissions.controller';
import { RelationalSubmissionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { GamificationProfilesModule } from '../gamification-profiles/gamification-profiles.module';
import { ActivitiesModule } from '../activities/activities.module';
import { BadgesModule } from '../badges/badges.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TrackItemsModule } from '../track-items/track-items.module';
import { TrackItemCompletionsModule } from '../track-item-completions/track-item-completions.module';
import { LearningTracksModule } from '../learning-tracks/learning-tracks.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { MailModule } from '../mail/mail.module';
import { FilesModule } from '../files/files.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalSubmissionPersistenceModule,
    GamificationProfilesModule,
    ActivitiesModule,
    BadgesModule,
    NotificationsModule,
    TrackItemsModule,
    TrackItemCompletionsModule,
    LearningTracksModule,
    AuditLogsModule,
    MailModule,
    FilesModule,
    UsersModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, SubmissionsCronService],
  exports: [SubmissionsService, RelationalSubmissionPersistenceModule],
})
export class SubmissionsModule {}
