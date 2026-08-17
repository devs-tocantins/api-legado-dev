import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  Logger,
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
import { FilesService } from '../files/files.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditActionEnum } from '../audit-logs/domain/audit-action.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/domain/notification-type.enum';

const COVER_IMAGE_RETENTION_MS = 3 * 24 * 60 * 60 * 1000; // 3 dias após o evento

const NOTIFIABLE_FIELD_LABELS: Record<string, string> = {
  startAt: 'a data/horário de início',
  endAt: 'a data/horário de término',
  modality: 'a modalidade',
  location: 'o local',
  locationMapUrl: 'o link do mapa',
  onlineUrl: 'o link online',
};

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventSubscriptionRepository: EventSubscriptionRepository,
    private readonly eventsIcsService: EventsIcsService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly filesService: FilesService,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private validateStartAtNotInPast(startAt?: string) {
    if (startAt && new Date(startAt).getTime() < Date.now()) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          startAt: 'A data do evento não pode ser no passado.',
        },
      });
    }
  }

  async create(createEventDto: CreateEventDto, organizerId: number) {
    this.validateStartAtNotInPast(createEventDto.startAt);

    return this.eventRepository.create({
      title: createEventDto.title,
      description: createEventDto.description,
      category: createEventDto.category,
      modality: createEventDto.modality,
      startAt: new Date(createEventDto.startAt),
      endAt: createEventDto.endAt ? new Date(createEventDto.endAt) : null,
      location: createEventDto.location ?? null,
      locationMapUrl: createEventDto.locationMapUrl ?? null,
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
    canManageAny: boolean,
  ): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }
    if (event.organizerId !== userId && !canManageAny) {
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
    canManageAny: boolean,
  ) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }
    if (event.organizerId !== userId && !canManageAny) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este evento.',
      );
    }

    if (updateEventDto.startAt !== undefined) {
      this.validateStartAtNotInPast(updateEventDto.startAt);
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
      ...(updateEventDto.locationMapUrl !== undefined && {
        locationMapUrl: updateEventDto.locationMapUrl,
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

    const oldCoverImageId = event.coverImageId;
    const updatedEvent = await this.eventRepository.update(id, payload);

    if (
      'coverImageId' in payload &&
      oldCoverImageId &&
      oldCoverImageId !== payload.coverImageId
    ) {
      await this.filesService.remove(oldCoverImageId);
    }

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
        try {
          await this.notifySubscribersOfUpdate(updatedEvent, changedFields);
        } catch (err) {
          this.logger.error('Error notifying subscribers of event update', err);
        }
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

    const updated = await this.eventRepository.update(id, {
      status: reviewEventDto.status,
      rejectionReason:
        reviewEventDto.status === EventStatus.REJECTED
          ? (reviewEventDto.rejectionReason ?? null)
          : null,
      reviewerId,
      reviewedAt: new Date(),
    });

    void this.auditLogsService.record({
      actorUserId: reviewerId,
      action:
        reviewEventDto.status === EventStatus.APPROVED
          ? AuditActionEnum.EVENT_APPROVED
          : AuditActionEnum.EVENT_REJECTED,
      entityType: 'event',
      entityId: id,
      targetUserId: event.organizerId,
      metadata:
        reviewEventDto.status === EventStatus.REJECTED
          ? { rejectionReason: reviewEventDto.rejectionReason }
          : {},
    });

    return updated;
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
      try {
        await this.notifySubscribersOfCancellation(cancelledEvent);
      } catch (err) {
        this.logger.error(
          'Error notifying subscribers of event cancellation',
          err,
        );
      }
      void this.auditLogsService.record({
        actorUserId: userId,
        action: AuditActionEnum.EVENT_CANCELLED,
        entityType: 'event',
        entityId: id,
        targetUserId: event.organizerId,
      });
    }

    return cancelledEvent;
  }

  async remove(id: Event['id']) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }
    await this.eventRepository.remove(id);
    if (event.coverImageId) {
      await this.filesService.remove(event.coverImageId);
    }
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
    const subscriberIds =
      await this.eventSubscriptionRepository.findSubscriberUserIds(event.id);
    if (subscriberIds.length === 0) return;

    const users = await this.usersService.findByIds(subscriberIds);
    if (users.length === 0) return;

    const changesSummary = `Foi alterado(a): ${changedFields
      .map((field) => NOTIFIABLE_FIELD_LABELS[field])
      .join(', ')}.`;

    const results = await Promise.allSettled(
      users.map(async (user) => {
        await this.notificationsService.create({
          userId: user.id as number,
          type: NotificationType.EVENT_UPDATED,
          title: `Atualização no evento: ${event.title}`,
          body: changesSummary,
          relatedId: event.id,
          link: `/eventos/${event.id}`,
          payload: { eventId: event.id },
        });

        if (user.email) {
          await this.mailService.eventUpdated({
            to: user.email,
            data: {
              eventId: event.id,
              eventTitle: event.title,
              changesSummary,
            },
          });
        }
      }),
    );

    results.forEach((res, index) => {
      if (res.status === 'rejected') {
        this.logger.error(
          `Error notifying user ${users[index].id} of event update`,
          res.reason,
        );
      }
    });
  }

  private async notifySubscribersOfCancellation(event: Event): Promise<void> {
    const subscriberIds =
      await this.eventSubscriptionRepository.findSubscriberUserIds(event.id);
    if (subscriberIds.length === 0) return;

    const users = await this.usersService.findByIds(subscriberIds);
    if (users.length === 0) return;

    const results = await Promise.allSettled(
      users.map(async (user) => {
        await this.notificationsService.create({
          userId: user.id as number,
          type: NotificationType.EVENT_CANCELLED,
          title: `Evento cancelado: ${event.title}`,
          body: `O evento "${event.title}" foi cancelado.`,
          relatedId: event.id,
          link: `/eventos/${event.id}`,
          payload: { eventId: event.id },
        });

        if (user.email) {
          await this.mailService.eventCancelled({
            to: user.email,
            data: { eventTitle: event.title },
          });
        }
      }),
    );

    results.forEach((res, index) => {
      if (res.status === 'rejected') {
        this.logger.error(
          `Error notifying user ${users[index].id} of event cancellation`,
          res.reason,
        );
      }
    });
  }

  /**
   * Apaga a capa (imagem) de eventos cujo término (ou início, se não houver
   * término) já passou há mais de 3 dias — libera espaço no storage para
   * eventos que não vão mais ser exibidos publicamente.
   */
  async cleanupEndedCoverImages(): Promise<number> {
    const cutoff = new Date(Date.now() - COVER_IMAGE_RETENTION_MS);
    const events = await this.eventRepository.findEndedWithCoverImage(cutoff);

    for (const event of events) {
      if (event.coverImageId) {
        await this.filesService.remove(event.coverImageId);
        await this.eventRepository.update(event.id, { coverImageId: null });
      }
    }

    return events.length;
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
