import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './domain/event';
import { EventCategory } from './domain/event-category.enum';
import { EventModality } from './domain/event-modality.enum';
import { EventStatus } from './domain/event-status.enum';
import { RoleEnum } from '../roles/roles.enum';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ReviewEventDto } from './dto/review-event.dto';
import { FindAllEventsDto } from './dto/find-all-events.dto';

const mockUserId = 42;
const mockReq = { user: { id: mockUserId, role: { id: RoleEnum.user } } };
const mockAdminReq = { user: { id: 1, role: { id: RoleEnum.admin } } };
const mockModeratorReq = { user: { id: 2, role: { id: RoleEnum.moderator } } };

const mockEvent: Event = {
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
  organizerId: mockUserId,
  reviewerId: null,
  reviewedAt: null,
  coverImageId: null,
  coverImage: null,
  googleCalendarUrl: 'https://calendar.google.com/calendar/render?...',
  createdAt: new Date('2026-07-01'),
  updatedAt: new Date('2026-07-01'),
};

const mockService: Partial<Record<keyof EventsService, jest.Mock>> = {
  create: jest.fn().mockResolvedValue(mockEvent),
  findAllPublic: jest.fn().mockResolvedValue([mockEvent]),
  findMine: jest.fn().mockResolvedValue([mockEvent]),
  findPending: jest.fn().mockResolvedValue([mockEvent]),
  findAllAdmin: jest.fn().mockResolvedValue([mockEvent]),
  findPublicDetail: jest.fn().mockResolvedValue(mockEvent),
  findForManagement: jest.fn().mockResolvedValue(mockEvent),
  update: jest.fn().mockResolvedValue(mockEvent),
  review: jest.fn().mockResolvedValue(mockEvent),
  cancel: jest
    .fn()
    .mockResolvedValue({ ...mockEvent, status: EventStatus.CANCELLED }),
  subscribe: jest.fn().mockResolvedValue(undefined),
  unsubscribe: jest.fn().mockResolvedValue(undefined),
  isSubscribed: jest.fn().mockResolvedValue(true),
  remove: jest.fn().mockResolvedValue(undefined),
  generateIcs: jest.fn().mockResolvedValue({
    filename: 'evento-event-uuid-0001.ics',
    content: 'BEGIN:VCALENDAR...',
  }),
};

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an event using userId from JWT and return it', async () => {
      const dto: CreateEventDto = {
        title: 'Meetup de TI',
        description: 'Uma noite de talks sobre TI.',
        category: EventCategory.MEETUP,
        modality: EventModality.PRESENCIAL,
        startAt: '2026-08-15T19:00:00.000Z',
        location: 'Rua Exemplo, 123',
      };

      const result = await controller.create(dto, mockReq as any);

      expect(service.create).toHaveBeenCalledWith(dto, mockUserId);
      expect(result).toEqual(mockEvent);
      expect(result.status).toBe(EventStatus.PENDING);
    });
  });

  describe('findAll', () => {
    it('should return public paginated events with default page/limit and filters', async () => {
      const query: FindAllEventsDto = { category: EventCategory.WORKSHOP };
      const result = await controller.findAll(query);

      expect(service.findAllPublic).toHaveBeenCalledWith({
        paginationOptions: { page: 1, limit: 10 },
        filters: { category: EventCategory.WORKSHOP, modality: undefined },
      });
      expect(result.data).toEqual([mockEvent]);
    });

    it('should cap limit at 50 when a higher value is provided', async () => {
      const query: FindAllEventsDto = { page: 2, limit: 999 };
      await controller.findAll(query);

      expect(service.findAllPublic).toHaveBeenCalledWith({
        paginationOptions: { page: 2, limit: 50 },
        filters: { category: undefined, modality: undefined },
      });
    });
  });

  describe('findMine', () => {
    it('should return paginated events for the authenticated user', async () => {
      const result = await controller.findMine({}, mockReq as any);

      expect(service.findMine).toHaveBeenCalledWith(mockUserId, {
        page: 1,
        limit: 10,
      });
      expect(result.data).toEqual([mockEvent]);
    });
  });

  describe('findPending', () => {
    it('should return paginated pending events', async () => {
      const result = await controller.findPending({});

      expect(service.findPending).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result.data).toEqual([mockEvent]);
    });
  });

  describe('findAllAdmin', () => {
    it('should return all events regardless of status', async () => {
      const result = await controller.findAllAdmin({});

      expect(service.findAllAdmin).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result.data).toEqual([mockEvent]);
    });
  });

  describe('findById', () => {
    it('should return the public detail of a single event by id', async () => {
      const result = await controller.findById(mockEvent.id);

      expect(service.findPublicDetail).toHaveBeenCalledWith(mockEvent.id);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findForManagement', () => {
    it('should return the event for management with canManageAny=false for a regular user', async () => {
      const result = await controller.findForManagement(
        mockEvent.id,
        mockReq as any,
      );

      expect(service.findForManagement).toHaveBeenCalledWith(
        mockEvent.id,
        mockUserId,
        false,
      );
      expect(result).toEqual(mockEvent);
    });

    it('should pass canManageAny=true when the requester is an admin', async () => {
      await controller.findForManagement(mockEvent.id, mockAdminReq as any);

      expect(service.findForManagement).toHaveBeenCalledWith(
        mockEvent.id,
        1,
        true,
      );
    });

    it('should pass canManageAny=true when the requester is a moderator', async () => {
      await controller.findForManagement(mockEvent.id, mockModeratorReq as any);

      expect(service.findForManagement).toHaveBeenCalledWith(
        mockEvent.id,
        2,
        true,
      );
    });
  });

  describe('downloadIcs', () => {
    it('should stream the ics file with the correct headers', async () => {
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.downloadIcs(mockEvent.id, '30', res as any);

      expect(service.generateIcs).toHaveBeenCalledWith(mockEvent.id, 30);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/calendar; charset=utf-8',
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="evento-event-uuid-0001.ics"',
      );
      expect(res.send).toHaveBeenCalledWith('BEGIN:VCALENDAR...');
    });

    it('should default reminderMinutes to 60 when not provided', async () => {
      const res = { setHeader: jest.fn(), send: jest.fn() };

      await controller.downloadIcs(mockEvent.id, undefined, res as any);

      expect(service.generateIcs).toHaveBeenCalledWith(mockEvent.id, 60);
    });
  });

  describe('review', () => {
    it('should review an event using the reviewer id from JWT', async () => {
      const dto: ReviewEventDto = { status: EventStatus.APPROVED };

      const result = await controller.review(
        mockEvent.id,
        dto,
        mockAdminReq as any,
      );

      expect(service.review).toHaveBeenCalledWith(mockEvent.id, dto, 1);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('update', () => {
    it('should update an event, passing canManageAny=false for a regular user', async () => {
      const dto: UpdateEventDto = { title: 'Novo título' };

      const result = await controller.update(mockEvent.id, dto, mockReq as any);

      expect(service.update).toHaveBeenCalledWith(
        mockEvent.id,
        dto,
        mockUserId,
        false,
      );
      expect(result).toEqual(mockEvent);
    });

    it('should pass canManageAny=true when the requester is an admin', async () => {
      const dto: UpdateEventDto = { title: 'Novo título' };

      await controller.update(mockEvent.id, dto, mockAdminReq as any);

      expect(service.update).toHaveBeenCalledWith(mockEvent.id, dto, 1, true);
    });

    it('should pass canManageAny=true when the requester is a moderator', async () => {
      const dto: UpdateEventDto = { title: 'Novo título' };

      await controller.update(mockEvent.id, dto, mockModeratorReq as any);

      expect(service.update).toHaveBeenCalledWith(mockEvent.id, dto, 2, true);
    });
  });

  describe('remove', () => {
    it('should remove an event by id', async () => {
      await controller.remove(mockEvent.id);

      expect(service.remove).toHaveBeenCalledWith(mockEvent.id);
    });
  });

  describe('subscribe/unsubscribe/getSubscription', () => {
    it('should subscribe the authenticated user to an event', async () => {
      await controller.subscribe(mockEvent.id, mockReq as any);

      expect(service.subscribe).toHaveBeenCalledWith(mockEvent.id, mockUserId);
    });

    it('should unsubscribe the authenticated user from an event', async () => {
      await controller.unsubscribe(mockEvent.id, mockReq as any);

      expect(service.unsubscribe).toHaveBeenCalledWith(
        mockEvent.id,
        mockUserId,
      );
    });

    it('should return the subscription status for the authenticated user', async () => {
      const result = await controller.getSubscription(
        mockEvent.id,
        mockReq as any,
      );

      expect(service.isSubscribed).toHaveBeenCalledWith(
        mockEvent.id,
        mockUserId,
      );
      expect(result).toEqual({ subscribed: true });
    });
  });

  describe('cancel', () => {
    it('should cancel an event as the organizer (canManageAny=false)', async () => {
      const result = await controller.cancel(mockEvent.id, mockReq as any);

      expect(service.cancel).toHaveBeenCalledWith(
        mockEvent.id,
        mockUserId,
        false,
      );
      expect(result?.status).toBe(EventStatus.CANCELLED);
    });

    it('should cancel an event as admin (canManageAny=true)', async () => {
      await controller.cancel(mockEvent.id, mockAdminReq as any);

      expect(service.cancel).toHaveBeenCalledWith(mockEvent.id, 1, true);
    });

    it('should cancel an event as moderator (canManageAny=true)', async () => {
      await controller.cancel(mockEvent.id, mockModeratorReq as any);

      expect(service.cancel).toHaveBeenCalledWith(mockEvent.id, 2, true);
    });
  });
});
