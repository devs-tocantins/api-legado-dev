import { Module } from '@nestjs/common';
import { EventRepository } from '../event.repository';
import { EventRelationalRepository } from './repositories/event.repository';
import { EventSubscriptionRepository } from '../event-subscription.repository';
import { EventSubscriptionRelationalRepository } from './repositories/event-subscription.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { EventSubscriptionEntity } from './entities/event-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, EventSubscriptionEntity])],
  providers: [
    {
      provide: EventRepository,
      useClass: EventRelationalRepository,
    },
    {
      provide: EventSubscriptionRepository,
      useClass: EventSubscriptionRelationalRepository,
    },
  ],
  exports: [EventRepository, EventSubscriptionRepository],
})
export class RelationalEventPersistenceModule {}
