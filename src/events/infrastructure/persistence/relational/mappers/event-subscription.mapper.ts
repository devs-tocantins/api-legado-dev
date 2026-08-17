import { EventSubscription } from '../../../../domain/event-subscription';
import { EventSubscriptionEntity } from '../entities/event-subscription.entity';

export class EventSubscriptionMapper {
  static toDomain(raw: EventSubscriptionEntity): EventSubscription {
    const domainEntity = new EventSubscription();
    domainEntity.id = raw.id;
    domainEntity.eventId = raw.eventId;
    domainEntity.userId = raw.userId;
    domainEntity.createdAt = raw.createdAt;
    return domainEntity;
  }
}
