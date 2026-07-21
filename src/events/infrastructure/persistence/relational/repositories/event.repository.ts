import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { EventEntity } from '../entities/event.entity';
import { EventStatus } from '../../../../domain/event-status.enum';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Event } from '../../../../domain/event';
import { EventPublicFilters, EventRepository } from '../../event.repository';
import { EventMapper } from '../mappers/event.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class EventRelationalRepository implements EventRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
  ) {}

  async create(data: Event): Promise<Event> {
    const persistenceModel = EventMapper.toPersistence(data);
    const newEntity = await this.eventRepository.save(
      this.eventRepository.create(persistenceModel),
    );
    return EventMapper.toDomain(newEntity);
  }

  async findPublicWithPagination(
    paginationOptions: IPaginationOptions,
    filters?: EventPublicFilters,
  ): Promise<Event[]> {
    const entities = await this.eventRepository.find({
      where: {
        status: EventStatus.APPROVED,
        startAt: MoreThanOrEqual(new Date()),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.modality && { modality: filters.modality }),
      },
      order: { startAt: 'ASC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => EventMapper.toDomain(entity));
  }

  async findByOrganizerId(
    organizerId: Event['organizerId'],
    paginationOptions: IPaginationOptions,
  ): Promise<Event[]> {
    const entities = await this.eventRepository.find({
      where: { organizerId },
      order: { createdAt: 'DESC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => EventMapper.toDomain(entity));
  }

  async findByStatus(
    status: EventStatus,
    paginationOptions: IPaginationOptions,
  ): Promise<Event[]> {
    const entities = await this.eventRepository.find({
      where: { status },
      order: { createdAt: 'ASC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => EventMapper.toDomain(entity));
  }

  async findAllWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<Event[]> {
    const entities = await this.eventRepository.find({
      order: { createdAt: 'DESC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => EventMapper.toDomain(entity));
  }

  async findById(id: Event['id']): Promise<NullableType<Event>> {
    const entity = await this.eventRepository.findOne({
      where: { id },
    });

    return entity ? EventMapper.toDomain(entity) : null;
  }

  async update(id: Event['id'], payload: Partial<Event>): Promise<Event> {
    const entity = await this.eventRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.eventRepository.save(
      this.eventRepository.create(
        EventMapper.toPersistence({
          ...EventMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return EventMapper.toDomain(updatedEntity);
  }

  async remove(id: Event['id']): Promise<void> {
    await this.eventRepository.delete(id);
  }

  async findEndedWithCoverImage(cutoff: Date): Promise<Event[]> {
    const entities = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.coverImageId IS NOT NULL')
      .andWhere('COALESCE(event.endAt, event.startAt) < :cutoff', { cutoff })
      .getMany();

    return entities.map((entity) => EventMapper.toDomain(entity));
  }
}
