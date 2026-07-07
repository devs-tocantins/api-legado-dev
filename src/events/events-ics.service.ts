import { BadRequestException, Injectable } from '@nestjs/common';
import ical, { ICalAlarmType, ICalEventStatus } from 'ical-generator';
import { Event } from './domain/event';
import { EventModality } from './domain/event-modality.enum';

export const ALLOWED_REMINDER_MINUTES: number[] = [15, 30, 60, 1440];

const ONE_HOUR_MS = 60 * 60 * 1000;

@Injectable()
export class EventsIcsService {
  generate(
    event: Event,
    reminderMinutes: number,
  ): { filename: string; content: string } {
    if (!ALLOWED_REMINDER_MINUTES.includes(reminderMinutes)) {
      throw new BadRequestException(
        `reminderMinutes deve ser um dos valores: ${ALLOWED_REMINDER_MINUTES.join(', ')}`,
      );
    }

    const calendar = ical({ name: 'Agenda Pública de Eventos - legado.dev' });

    const icalEvent = calendar.createEvent({
      start: event.startAt,
      end: event.endAt ?? new Date(event.startAt.getTime() + ONE_HOUR_MS),
      summary: event.title,
      description: event.description,
      location:
        event.modality === EventModality.ONLINE
          ? (event.onlineUrl ?? undefined)
          : (event.location ?? undefined),
      url: event.externalUrl ?? undefined,
      status: ICalEventStatus.CONFIRMED,
    });

    icalEvent.createAlarm({
      type: ICalAlarmType.display,
      trigger: reminderMinutes * 60,
    });

    return {
      filename: `evento-${event.id}.ics`,
      content: calendar.toString(),
    };
  }
}
