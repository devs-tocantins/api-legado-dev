import { buildGoogleCalendarUrl } from './events-calendar-link.util';
import { EventModality } from './domain/event-modality.enum';

describe('buildGoogleCalendarUrl', () => {
  const baseEvent = {
    title: 'Meetup de TI',
    description: 'Uma noite de talks sobre TI e comunidade.',
    startAt: new Date('2026-08-15T19:00:00.000Z'),
    endAt: new Date('2026-08-15T21:00:00.000Z') as Date | null,
    modality: EventModality.PRESENCIAL,
    location: 'Rua Exemplo, 123 - Fortaleza/CE' as string | null,
    onlineUrl: null as string | null,
  };

  it('should format start/end dates as YYYYMMDDTHHmmssZ', () => {
    const url = buildGoogleCalendarUrl(baseEvent);
    const params = new URL(url).searchParams;

    expect(params.get('dates')).toBe('20260815T190000Z/20260815T210000Z');
  });

  it('should point to the google calendar render endpoint with action=TEMPLATE', () => {
    const url = buildGoogleCalendarUrl(baseEvent);

    expect(url.startsWith('https://calendar.google.com/calendar/render?')).toBe(
      true,
    );
    expect(new URL(url).searchParams.get('action')).toBe('TEMPLATE');
  });

  it('should url-encode accented text and spaces in text/details', () => {
    const url = buildGoogleCalendarUrl({
      ...baseEvent,
      title: 'Café com código & comunidade',
    });
    const params = new URL(url).searchParams;

    expect(params.get('text')).toBe('Café com código & comunidade');
    expect(url).toContain('text=Caf%C3%A9');
  });

  it('should use location for PRESENCIAL/HIBRIDO modality', () => {
    const url = buildGoogleCalendarUrl(baseEvent);
    expect(new URL(url).searchParams.get('location')).toBe(
      'Rua Exemplo, 123 - Fortaleza/CE',
    );
  });

  it('should use onlineUrl for ONLINE modality', () => {
    const url = buildGoogleCalendarUrl({
      ...baseEvent,
      modality: EventModality.ONLINE,
      location: null,
      onlineUrl: 'https://meet.google.com/abc-defg-hij',
    });
    expect(new URL(url).searchParams.get('location')).toBe(
      'https://meet.google.com/abc-defg-hij',
    );
  });

  it('should default endAt to startAt + 1h when not provided', () => {
    const url = buildGoogleCalendarUrl({ ...baseEvent, endAt: null });
    const params = new URL(url).searchParams;

    expect(params.get('dates')).toBe('20260815T190000Z/20260815T200000Z');
  });

  it('should fall back to empty location when neither location nor onlineUrl is set', () => {
    const url = buildGoogleCalendarUrl({
      ...baseEvent,
      location: null,
      onlineUrl: null,
    });
    expect(new URL(url).searchParams.get('location')).toBe('');
  });
});
