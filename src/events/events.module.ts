import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsIcsService } from './events-ics.service';
import { EventsCleanupCronService } from './events-cleanup-cron.service';
import { RelationalEventPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { FilesModule } from '../files/files.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    RelationalEventPersistenceModule,
    UsersModule,
    MailModule,
    FilesModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
    AuditLogsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsIcsService, EventsCleanupCronService],
  exports: [EventsService, RelationalEventPersistenceModule],
})
export class EventsModule {}
