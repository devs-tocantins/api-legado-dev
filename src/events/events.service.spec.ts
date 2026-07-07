import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { EventRepository } from './infrastructure/persistence/event.repository';
import { EventSubscriptionRepository } from './infrastructure/persistence/event-subscription.repository';
import { EventsIcsService } from './events-ics.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { DataSource } from 'typeorm';
import { Event } from './domain/event';
import { EventCategory } from './domain/event-category.enum';
import { EventModality } from './domain/event-modality.enum';
import { EventStatus } from './domain/event-status.enum';
import { CreateEventDto } from './dto/create-event.dto';
import { ReviewEventDto } from './dto/review-event.dto';

const buildEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 'event-uuid-0001',
  title: 'Meetup de TI',
  description: 'Uma noite de talks sobre TI.',
  category: EventCategory.MEETUP,
  modality: EventModality.PRESENCIAL,
  startAt: new Date('2026-08-15T19:00:00.000Z'),
  endAt: new Date('2026-08-15T21:00:00.000Z'),
  location: 'Rua Exemplo, 123',
  onlineUrl: null,
  externalUrl: null,
  status: EventStatus.PENDING,
  rejectionReason: null,
  organizerId: 42,
  reviewerId: null,
  reviewedAt: null,
  coverImageId: null,
  coverImage: null,
  googleCalendarUrl: 'https://calendar.google.com/calendar/render?...',
  createdAt: new Date('2026-07-01'),
  updatedAt: new Date('2026-07-01'),
  ...overrides,
});

describe('EventsService', () => {
  let service: EventsService;
  let repository: Partial<Record<keyof EventRepository, jest.Mock>>;
  let subscriptionRepository: Partial<
    Record<keyof EventSubscriptionRepository, jest.Mock>
  >;
  let icsService: Partial<Record<keyof EventsIcsService, jest.Mock>>;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let mailService: Partial<Record<keyof MailService, jest.Mock>>;
  let whatsappService: Partial<Record<keyof WhatsappService, jest.Mock>>;
  let dataSource: Partial<Record<keyof DataSource, jest.Mock>>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findPublicWithPagination: jest.fn(),
      findByOrganizerId: jest.fn(),
      findByStatus: jest.fn(),
      findAllWithPagination: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    subscriptionRepository = {
      create: jest.fn(),
      remove: jest.fn(),
      isSubscribed: jest.fn(),
      findSubscriberUserIds: jest.fn().mockResolvedValue([]),
    };
    icsService = {
      generate: jest.fn(),
    };
    usersService = {
      findByIds: jest.fn().mockResolvedValue([]),
    };
    mailService = {
      eventUpdated: jest.fn(),
      eventCancelled: jest.fn(),
    };
    whatsappService = {
      sendText: jest.fn(),
    };
    dataSource = {
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn().mockResolvedValue([]),
      }),
    };

    service = new EventsService(
      repository as unknown as EventRepository,
      subscriptionRepository as unknown as EventSubscriptionRepository,
      icsService as unknown as EventsIcsService,
      usersService as unknown as UsersService,
      mailService as unknown as MailService,
      whatsappService as unknown as WhatsappService,
      dataSource as unknown as DataSource,
    );
  });

  describe('create', () => {
    it('should create an event with status PENDING regardless of input', async () => {
      const dto: CreateEventDto = {
        title: 'Meetup de TI',
        description: 'desc',
        category: EventCategory.MEETUP,
        modality: EventModality.PRESENCIAL,
        startAt: '2026-08-15T19:00:00.000Z',
        location: 'Rua Exemplo, 123',
      };
      repository.create!.mockResolvedValue(buildEvent());

      await service.create(dto, 42);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: EventStatus.PENDING,
          organizerId: 42,
          reviewerId: null,
          reviewedAt: null,
        }),
      );
    });
  });

  describe('findPublicDetail', () => {
    it('should return the event when it is APPROVED', async () => {
      const approved = buildEvent({ status: EventStatus.APPROVED });
      repository.findById!.mockResolvedValue(approved);

      const result = await service.findPublicDetail(approved.id);

      expect(result).toEqual(approved);
    });

    it('should return the event when it is CANCELLED', async () => {
      const cancelled = buildEvent({ status: EventStatus.CANCELLED });
      repository.findById!.mockResolvedValue(cancelled);

      const result = await service.findPublicDetail(cancelled.id);

      expect(result).toEqual(cancelled);
    });

    it('should throw NotFoundException when the event is PENDING', async () => {
      repository.findById!.mockResolvedValue(
        buildEvent({ status: EventStatus.PENDING }),
      );

      await expect(service.findPublicDetail('event-uuid-0001')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when the event does not exist', async () => {
      repository.findById!.mockResolvedValue(null);

      await expect(service.findPublicDetail('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('review', () => {
    it('should throw BadRequestException when reviewing a non-PENDING event', async () => {
      repository.findById!.mockResolvedValue(
        buildEvent({ status: EventStatus.APPROVED }),
      );
      const dto: ReviewEventDto = { status: EventStatus.APPROVED };

      await expect(service.review('event-uuid-0001', dto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should require rejectionReason when rejecting', async () => {
      repository.findById!.mockResolvedValue(buildEvent());
      const dto: ReviewEventDto = { status: EventStatus.REJECTED };

      await expect(service.review('event-uuid-0001', dto, 1)).rejects.toThrow(
        'É obrigatório informar um motivo ao rejeitar um evento.',
      );
    });

    it('should approve a PENDING event and record reviewer/reviewedAt', async () => {
      repository.findById!.mockResolvedValue(buildEvent());
      repository.update!.mockResolvedValue(
        buildEvent({ status: EventStatus.APPROVED }),
      );
      const dto: ReviewEventDto = { status: EventStatus.APPROVED };

      await service.review('event-uuid-0001', dto, 7);

      expect(repository.update).toHaveBeenCalledWith(
        'event-uuid-0001',
        expect.objectContaining({
          status: EventStatus.APPROVED,
          rejectionReason: null,
          reviewerId: 7,
        }),
      );
    });
  });

  describe('update', () => {
    it('should allow the organizer to edit their own event', async () => {
      repository.findById!.mockResolvedValue(buildEvent({ organizerId: 42 }));
      repository.update!.mockResolvedValue(buildEvent());

      await service.update('event-uuid-0001', { title: 'Novo' }, 42, false);

      expect(repository.update).toHaveBeenCalled();
    });

    it('should allow an admin to edit any event', async () => {
      repository.findById!.mockResolvedValue(buildEvent({ organizerId: 99 }));
      repository.update!.mockResolvedValue(buildEvent());

      await service.update('event-uuid-0001', { title: 'Novo' }, 1, true);

      expect(repository.update).toHaveBeenCalled();
    });

    it('should forbid a non-organizer, non-admin user from editing', async () => {
      repository.findById!.mockResolvedValue(buildEvent({ organizerId: 99 }));

      await expect(
        service.update('event-uuid-0001', { title: 'Novo' }, 42, false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when the event does not exist', async () => {
      repository.findById!.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { title: 'Novo' }, 42, false),
      ).rejects.toThrow(NotFoundException);
    });

    it('should notify subscribers by email when an APPROVED event has its location changed', async () => {
      const approved = buildEvent({
        status: EventStatus.APPROVED,
        location: 'Local antigo',
      });
      repository.findById!.mockResolvedValue(approved);
      repository.update!.mockResolvedValue({
        ...approved,
        location: 'Local novo',
      });
      subscriptionRepository.findSubscriberUserIds!.mockResolvedValue([1, 2]);
      usersService.findByIds!.mockResolvedValue([
        { id: 1, email: 'a@example.com' },
        { id: 2, email: 'b@example.com' },
      ]);

      await service.update(
        'event-uuid-0001',
        { location: 'Local novo' },
        42,
        false,
      );

      expect(mailService.eventUpdated).toHaveBeenCalledTimes(2);
      expect(mailService.eventUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'a@example.com' }),
      );
    });

    it('should not notify subscribers when the event is still PENDING', async () => {
      repository.findById!.mockResolvedValue(
        buildEvent({ status: EventStatus.PENDING }),
      );
      repository.update!.mockResolvedValue(
        buildEvent({ status: EventStatus.PENDING, location: 'Local novo' }),
      );

      await service.update(
        'event-uuid-0001',
        { location: 'Local novo' },
        42,
        false,
      );

      expect(mailService.eventUpdated).not.toHaveBeenCalled();
    });

    it('should not notify subscribers when no notifiable field changed', async () => {
      const approved = buildEvent({ status: EventStatus.APPROVED });
      repository.findById!.mockResolvedValue(approved);
      repository.update!.mockResolvedValue(approved);

      await service.update(
        'event-uuid-0001',
        { description: 'Nova descrição' },
        42,
        false,
      );

      expect(mailService.eventUpdated).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should cancel an APPROVED event owned by the requester and notify subscribers', async () => {
      const approved = buildEvent({ status: EventStatus.APPROVED });
      repository.findById!.mockResolvedValue(approved);
      repository.update!.mockResolvedValue({
        ...approved,
        status: EventStatus.CANCELLED,
      });
      subscriptionRepository.findSubscriberUserIds!.mockResolvedValue([1]);
      usersService.findByIds!.mockResolvedValue([
        { id: 1, email: 'a@example.com' },
      ]);

      const result = await service.cancel('event-uuid-0001', 42, false);

      expect(repository.update).toHaveBeenCalledWith('event-uuid-0001', {
        status: EventStatus.CANCELLED,
      });
      expect(mailService.eventCancelled).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'a@example.com' }),
      );
      expect(result?.status).toBe(EventStatus.CANCELLED);
    });

    it('should forbid a non-organizer, non-staff user from cancelling', async () => {
      repository.findById!.mockResolvedValue(
        buildEvent({ status: EventStatus.APPROVED, organizerId: 99 }),
      );

      await expect(
        service.cancel('event-uuid-0001', 42, false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when the event is not APPROVED', async () => {
      repository.findById!.mockResolvedValue(
        buildEvent({ status: EventStatus.PENDING }),
      );

      await expect(
        service.cancel('event-uuid-0001', 42, false),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('subscribe/unsubscribe/isSubscribed', () => {
    it('should subscribe a user to an approved event', async () => {
      repository.findById!.mockResolvedValue(
        buildEvent({ status: EventStatus.APPROVED }),
      );

      await service.subscribe('event-uuid-0001', 7);

      expect(subscriptionRepository.create).toHaveBeenCalledWith(
        'event-uuid-0001',
        7,
      );
    });

    it('should throw NotFoundException when subscribing to a non-public event', async () => {
      repository.findById!.mockResolvedValue(
        buildEvent({ status: EventStatus.PENDING }),
      );

      await expect(service.subscribe('event-uuid-0001', 7)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should unsubscribe a user', async () => {
      await service.unsubscribe('event-uuid-0001', 7);

      expect(subscriptionRepository.remove).toHaveBeenCalledWith(
        'event-uuid-0001',
        7,
      );
    });

    it('should check subscription status', async () => {
      subscriptionRepository.isSubscribed!.mockResolvedValue(true);

      const result = await service.isSubscribed('event-uuid-0001', 7);

      expect(result).toBe(true);
    });
  });

  describe('findForManagement', () => {
    it('should return the event for its organizer regardless of status', async () => {
      const pending = buildEvent({
        status: EventStatus.PENDING,
        organizerId: 42,
      });
      repository.findById!.mockResolvedValue(pending);

      const result = await service.findForManagement(
        'event-uuid-0001',
        42,
        false,
      );

      expect(result).toEqual(pending);
    });

    it('should return the event for an admin regardless of ownership', async () => {
      const pending = buildEvent({
        status: EventStatus.PENDING,
        organizerId: 99,
      });
      repository.findById!.mockResolvedValue(pending);

      const result = await service.findForManagement(
        'event-uuid-0001',
        1,
        true,
      );

      expect(result).toEqual(pending);
    });

    it('should forbid a non-organizer, non-admin user', async () => {
      repository.findById!.mockResolvedValue(buildEvent({ organizerId: 99 }));

      await expect(
        service.findForManagement('event-uuid-0001', 42, false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when the event does not exist', async () => {
      repository.findById!.mockResolvedValue(null);

      await expect(
        service.findForManagement('missing-id', 42, false),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateIcs', () => {
    it('should delegate to EventsIcsService using the approved event', async () => {
      const approved = buildEvent({ status: EventStatus.APPROVED });
      repository.findById!.mockResolvedValue(approved);
      icsService.generate!.mockReturnValue({
        filename: 'evento-event-uuid-0001.ics',
        content: 'BEGIN:VCALENDAR...',
      });

      const result = await service.generateIcs(approved.id, 30);

      expect(icsService.generate).toHaveBeenCalledWith(approved, 30);
      expect(result.filename).toBe('evento-event-uuid-0001.ics');
    });

    it('should throw NotFoundException for a non-approved, non-cancelled event', async () => {
      repository.findById!.mockResolvedValue(
        buildEvent({ status: EventStatus.PENDING }),
      );

      await expect(service.generateIcs('event-uuid-0001', 30)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
