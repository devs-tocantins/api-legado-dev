import { EventsIcsService } from './events-ics.service';
import { Event } from './domain/event';
import { EventCategory } from './domain/event-category.enum';
import { EventModality } from './domain/event-modality.enum';
import { EventStatus } from './domain/event-status.enum';

const mockEvent: Event = {
  id: 'event-uuid-0001',
  title: 'Meetup de TI',
  description: 'Uma noite de talks sobre TI e comunidade.',
  category: EventCategory.MEETUP,
  modality: EventModality.PRESENCIAL,
  startAt: new Date('2026-08-15T19:00:00.000Z'),
  endAt: new Date('2026-08-15T21:00:00.000Z'),
  location: 'Rua Exemplo, 123 - Fortaleza/CE',
  onlineUrl: null,
  externalUrl: null,
  status: EventStatus.APPROVED,
  rejectionReason: null,
  organizerId: 1,
  reviewerId: 2,
  reviewedAt: new Date('2026-08-01'),
  coverImageId: null,
  coverImage: null,
  googleCalendarUrl: 'https://calendar.google.com/calendar/render?...',
  createdAt: new Date('2026-07-01'),
  updatedAt: new Date('2026-07-01'),
};

describe('EventsIcsService', () => {
  let service: EventsIcsService;

  beforeEach(() => {
    service = new EventsIcsService();
  });

  it('should generate an ics file containing BEGIN:VEVENT and the event title', () => {
    const { filename, content } = service.generate(mockEvent, 60);

    expect(filename).toBe('evento-event-uuid-0001.ics');
    expect(content).toContain('BEGIN:VEVENT');
    expect(content).toContain('SUMMARY:Meetup de TI');
  });

  it.each([
    [15, '-PT15M'],
    [30, '-PT30M'],
    [60, '-PT1H'],
    [1440, '-P1D'],
  ])(
    'should embed a VALARM with TRIGGER matching %i minutes before the event',
    (minutes, expectedTrigger) => {
      const { content } = service.generate(mockEvent, minutes as number);

      expect(content).toContain('BEGIN:VALARM');
      expect(content).toContain(`TRIGGER:${expectedTrigger}`);
    },
  );

  it('should throw BadRequestException for a reminderMinutes value outside the whitelist', () => {
    expect(() => service.generate(mockEvent, 45)).toThrow(
      'reminderMinutes deve ser um dos valores: 15, 30, 60, 1440',
    );
  });
});
