import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventSubscriptionEntity } from '../entities/event-subscription.entity';
import { EventSubscriptionRepository } from '../../event-subscription.repository';
import { EventSubscriptionMapper } from '../mappers/event-subscription.mapper';
import { Event } from '../../../../domain/event';

@Injectable()
export class EventSubscriptionRelationalRepository
  implements EventSubscriptionRepository
{
  constructor(
    @InjectRepository(EventSubscriptionEntity)
    private readonly subscriptionRepository: Repository<EventSubscriptionEntity>,
  ) {}

  async create(eventId: Event['id'], userId: number) {
    const existing = await this.subscriptionRepository.findOne({
      where: { eventId, userId },
    });
    if (existing) {
      return EventSubscriptionMapper.toDomain(existing);
    }

    const newEntity = await this.subscriptionRepository.save(
      this.subscriptionRepository.create({ eventId, userId }),
    );
    return EventSubscriptionMapper.toDomain(newEntity);
  }

  async remove(eventId: Event['id'], userId: number): Promise<void> {
    await this.subscriptionRepository.delete({ eventId, userId });
  }

  async isSubscribed(eventId: Event['id'], userId: number): Promise<boolean> {
    const count = await this.subscriptionRepository.count({
      where: { eventId, userId },
    });
    return count > 0;
  }

  async findSubscriberUserIds(eventId: Event['id']): Promise<number[]> {
    const entities = await this.subscriptionRepository.find({
      where: { eventId },
    });
    return entities.map((entity) => entity.userId);
  }
}
