import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsIcsService } from './events-ics.service';
import { RelationalEventPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    RelationalEventPersistenceModule,
    UsersModule,
    MailModule,
    WhatsappModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsIcsService],
  exports: [EventsService, RelationalEventPersistenceModule],
})
export class EventsModule {}
