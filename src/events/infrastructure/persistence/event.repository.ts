import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Event } from '../../domain/event';
import { EventStatus } from '../../domain/event-status.enum';
import { EventCategory } from '../../domain/event-category.enum';
import { EventModality } from '../../domain/event-modality.enum';

export type EventPublicFilters = {
  category?: EventCategory;
  modality?: EventModality;
};

export abstract class EventRepository {
  abstract create(
    data: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'googleCalendarUrl'>,
  ): Promise<Event>;

  abstract findPublicWithPagination(
    paginationOptions: IPaginationOptions,
    filters?: EventPublicFilters,
  ): Promise<Event[]>;

  abstract findByOrganizerId(
    organizerId: Event['organizerId'],
    paginationOptions: IPaginationOptions,
  ): Promise<Event[]>;

  abstract findByStatus(
    status: EventStatus,
    paginationOptions: IPaginationOptions,
  ): Promise<Event[]>;

  abstract findAllWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<Event[]>;

  abstract findById(id: Event['id']): Promise<NullableType<Event>>;

  abstract update(
    id: Event['id'],
    payload: DeepPartial<Event>,
  ): Promise<Event | null>;

  abstract remove(id: Event['id']): Promise<void>;

  /**
   * Eventos com capa ainda associada cujo término (ou início, se não houver
   * término) já passou do corte informado — usado pela limpeza agendada de
   * armazenamento.
   */
  abstract findEndedWithCoverImage(cutoff: Date): Promise<Event[]>;
}
