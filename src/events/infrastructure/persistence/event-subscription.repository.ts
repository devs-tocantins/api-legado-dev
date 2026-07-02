import { EventSubscription } from '../../domain/event-subscription';
import { Event } from '../../domain/event';

export abstract class EventSubscriptionRepository {
  abstract create(
    eventId: Event['id'],
    userId: number,
  ): Promise<EventSubscription>;

  abstract remove(eventId: Event['id'], userId: number): Promise<void>;

  abstract isSubscribed(eventId: Event['id'], userId: number): Promise<boolean>;

  abstract findSubscriberUserIds(eventId: Event['id']): Promise<number[]>;
}
