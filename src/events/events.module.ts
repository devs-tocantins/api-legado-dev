import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsIcsService } from './events-ics.service';
import { RelationalEventPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [RelationalEventPersistenceModule, UsersModule, MailModule],
  controllers: [EventsController],
  providers: [EventsService, EventsIcsService],
  exports: [EventsService, RelationalEventPersistenceModule],
})
export class EventsModule {}
