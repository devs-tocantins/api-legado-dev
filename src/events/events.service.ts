import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ReviewEventDto } from './dto/review-event.dto';
import {
  EventPublicFilters,
  EventRepository,
} from './infrastructure/persistence/event.repository';
import { EventSubscriptionRepository } from './infrastructure/persistence/event-subscription.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Event } from './domain/event';
import { EventStatus } from './domain/event-status.enum';
import { EventsIcsService } from './events-ics.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

const NOTIFIABLE_FIELD_LABELS: Record<string, string> = {
  startAt: 'a data/horário de início',
  endAt: 'a data/horário de término',
  modality: 'a modalidade',
  location: 'o local',
  onlineUrl: 'o link online',
};

@Injectable()
export class EventsService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventSubscriptionRepository: EventSubscriptionRepository,
    private readonly eventsIcsService: EventsIcsService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  create(createEventDto: CreateEventDto, organizerId: number) {
    return this.eventRepository.create({
      title: createEventDto.title,
      description: createEventDto.description,
      category: createEventDto.category,
      modality: createEventDto.modality,
      startAt: new Date(createEventDto.startAt),
      endAt: createEventDto.endAt ? new Date(createEventDto.endAt) : null,
      location: createEventDto.location ?? null,
      onlineUrl: createEventDto.onlineUrl ?? null,
      externalUrl: createEventDto.externalUrl ?? null,
      status: EventStatus.PENDING,
      rejectionReason: null,
      organizerId,
      reviewerId: null,
      reviewedAt: null,
      coverImageId: createEventDto.coverImageId ?? null,
    });
  }

  findAllPublic({
    paginationOptions,
    filters,
  }: {
    paginationOptions: IPaginationOptions;
    filters?: EventPublicFilters;
  }) {
    return this.eventRepository.findPublicWithPagination(
      paginationOptions,
      filters,
    );
  }

  findMine(organizerId: number, paginationOptions: IPaginationOptions) {
    return this.eventRepository.findByOrganizerId(
      organizerId,
      paginationOptions,
    );
  }

  findPending(paginationOptions: IPaginationOptions) {
    return this.eventRepository.findByStatus(
      EventStatus.PENDING,
      paginationOptions,
    );
  }

  findAllAdmin(paginationOptions: IPaginationOptions) {
    return this.eventRepository.findAllWithPagination(paginationOptions);
  }

  findById(id: Event['id']) {
    return this.eventRepository.findById(id);
  }

  async findForManagement(
    id: Event['id'],
    userId: number,
    isAdmin: boolean,
  ): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }
    if (event.organizerId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'Você não tem permissão para visualizar este evento.',
      );
    }
    return event;
  }

  async findPublicDetail(id: Event['id']): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (
      !event ||
      (event.status !== EventStatus.APPROVED &&
        event.status !== EventStatus.CANCELLED)
    ) {
      throw new NotFoundException('Evento não encontrado.');
    }
    return event;
  }

  async update(
    id: Event['id'],
    updateEventDto: UpdateEventDto,
    userId: number,
    isAdmin: boolean,
  ) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }
    if (event.organizerId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este evento.',
      );
    }

    const payload = {
      ...(updateEventDto.title !== undefined && {
        title: updateEventDto.title,
      }),
      ...(updateEventDto.description !== undefined && {
        description: updateEventDto.description,
      }),
      ...(updateEventDto.category !== undefined && {
        category: updateEventDto.category,
      }),
      ...(updateEventDto.modality !== undefined && {
        modality: updateEventDto.modality,
      }),
      ...(updateEventDto.startAt !== undefined && {
        startAt: new Date(updateEventDto.startAt),
      }),
      ...(updateEventDto.endAt !== undefined && {
        endAt: updateEventDto.endAt ? new Date(updateEventDto.endAt) : null,
      }),
      ...(updateEventDto.location !== undefined && {
        location: updateEventDto.location,
      }),
      ...(updateEventDto.onlineUrl !== undefined && {
        onlineUrl: updateEventDto.onlineUrl,
      }),
      ...(updateEventDto.externalUrl !== undefined && {
        externalUrl: updateEventDto.externalUrl,
      }),
      ...(updateEventDto.coverImageId !== undefined && {
        coverImageId: updateEventDto.coverImageId,
      }),
    };

    const updatedEvent = await this.eventRepository.update(id, payload);

    if (event.status === EventStatus.APPROVED && updatedEvent) {
      const changedFields = Object.keys(NOTIFIABLE_FIELD_LABELS).filter(
        (field) =>
          field in payload &&
          this.hasChanged(
            event[field as keyof Event],
            updatedEvent[field as keyof Event],
          ),
      );
      if (changedFields.length > 0) {
        await this.notifySubscribersOfUpdate(updatedEvent, changedFields);
      }
    }

    return updatedEvent;
  }

  private hasChanged(before: unknown, after: unknown): boolean {
    if (before instanceof Date || after instanceof Date) {
      return (
        new Date(before as Date).getTime() !== new Date(after as Date).getTime()
      );
    }
    return before !== after;
  }

  async review(
    id: Event['id'],
    reviewEventDto: ReviewEventDto,
    reviewerId: number,
  ) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }
    if (event.status !== EventStatus.PENDING) {
      throw new BadRequestException(
        'Somente eventos com status PENDING podem ser revisados.',
      );
    }
    if (
      reviewEventDto.status === EventStatus.REJECTED &&
      !reviewEventDto.rejectionReason
    ) {
      throw new BadRequestException(
        'É obrigatório informar um motivo ao rejeitar um evento.',
      );
    }

    return this.eventRepository.update(id, {
      status: reviewEventDto.status,
      rejectionReason:
        reviewEventDto.status === EventStatus.REJECTED
          ? (reviewEventDto.rejectionReason ?? null)
          : null,
      reviewerId,
      reviewedAt: new Date(),
    });
  }

  async cancel(id: Event['id'], userId: number, canManageAny: boolean) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }
    if (event.organizerId !== userId && !canManageAny) {
      throw new ForbiddenException(
        'Você não tem permissão para cancelar este evento.',
      );
    }
    if (event.status !== EventStatus.APPROVED) {
      throw new BadRequestException(
        'Somente eventos aprovados podem ser cancelados.',
      );
    }

    const cancelledEvent = await this.eventRepository.update(id, {
      status: EventStatus.CANCELLED,
    });

    if (cancelledEvent) {
      await this.notifySubscribersOfCancellation(cancelledEvent);
    }

    return cancelledEvent;
  }

  async remove(id: Event['id']) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }
    return this.eventRepository.remove(id);
  }

  async generateIcs(id: Event['id'], reminderMinutes: number) {
    const event = await this.findPublicDetail(id);
    return this.eventsIcsService.generate(event, reminderMinutes);
  }

  async subscribe(id: Event['id'], userId: number): Promise<void> {
    await this.findPublicDetail(id);
    await this.eventSubscriptionRepository.create(id, userId);
  }

  async unsubscribe(id: Event['id'], userId: number): Promise<void> {
    await this.eventSubscriptionRepository.remove(id, userId);
  }

  isSubscribed(id: Event['id'], userId: number): Promise<boolean> {
    return this.eventSubscriptionRepository.isSubscribed(id, userId);
  }

  private async notifySubscribersOfUpdate(
    event: Event,
    changedFields: string[],
  ): Promise<void> {
    const subscriberEmails = await this.getSubscriberEmails(event.id);
    if (subscriberEmails.length === 0) return;

    const changesSummary = `Foi alterado(a): ${changedFields
      .map((field) => NOTIFIABLE_FIELD_LABELS[field])
      .join(', ')}.`;

    await Promise.all(
      subscriberEmails.map((email) =>
        this.mailService.eventUpdated({
          to: email,
          data: { eventId: event.id, eventTitle: event.title, changesSummary },
        }),
      ),
    );
  }

  private async notifySubscribersOfCancellation(event: Event): Promise<void> {
    const subscriberEmails = await this.getSubscriberEmails(event.id);
    if (subscriberEmails.length === 0) return;

    await Promise.all(
      subscriberEmails.map((email) =>
        this.mailService.eventCancelled({
          to: email,
          data: { eventTitle: event.title },
        }),
      ),
    );
  }

  private async getSubscriberEmails(eventId: Event['id']): Promise<string[]> {
    const subscriberIds =
      await this.eventSubscriptionRepository.findSubscriberUserIds(eventId);
    if (subscriberIds.length === 0) return [];

    const users = await this.usersService.findByIds(subscriberIds);
    return users
      .map((user) => user.email)
      .filter((email): email is string => !!email);
  }
}
