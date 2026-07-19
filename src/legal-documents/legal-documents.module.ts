import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LegalDocumentsNotificationCronService } from './legal-documents-notification-cron.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [ScheduleModule.forRoot(), NotificationsModule, MailModule],
  providers: [LegalDocumentsNotificationCronService],
})
export class LegalDocumentsModule {}
