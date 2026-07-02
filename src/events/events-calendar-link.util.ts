import { Event } from './domain/event';
import { EventModality } from './domain/event-modality.enum';

const ONE_HOUR_MS = 60 * 60 * 1000;

function formatGoogleCalendarDate(date: Date): string {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, '');
}

export function buildGoogleCalendarUrl(
  event: Pick<
    Event,
    | 'title'
    | 'description'
    | 'startAt'
    | 'endAt'
    | 'modality'
    | 'location'
    | 'onlineUrl'
  >,
): string {
  const start = formatGoogleCalendarDate(event.startAt);
  const end = formatGoogleCalendarDate(
    event.endAt ?? new Date(event.startAt.getTime() + ONE_HOUR_MS),
  );

  const location =
    event.modality === EventModality.ONLINE
      ? (event.onlineUrl ?? '')
      : (event.location ?? '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
