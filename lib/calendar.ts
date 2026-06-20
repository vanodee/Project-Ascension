import type { CalendarEvent, CalendarEventType } from './types';

// Google Calendar API integration (events.list on the public parish calendar).
// Mocked until the API key is provided — events are generated relative to today
// so the schedule page always shows a populated upcoming list.

const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  mass: 'Mass',
  confession: 'Confession',
  parish_event: 'Parish Event',
  meeting: 'Meeting',
  celebration: 'Special Celebration',
};

export function eventTypeLabel(type: CalendarEventType): string {
  return EVENT_TYPE_LABELS[type];
}

interface EventSeed {
  dayOffset: number;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  title: string;
  type: CalendarEventType;
  location: string;
  description: string;
}

const seeds: EventSeed[] = [
  { dayOffset: 0, startHour: 7, startMinute: 0, durationMinutes: 60, title: 'Morning Mass', type: 'mass', location: 'Chapel', description: 'Daily morning Mass. All are welcome.' },
  { dayOffset: 0, startHour: 12, startMinute: 0, durationMinutes: 45, title: 'Midday Mass', type: 'mass', location: 'Main Church', description: 'Daily midday Mass.' },
  { dayOffset: 1, startHour: 7, startMinute: 0, durationMinutes: 60, title: 'Morning Mass', type: 'mass', location: 'Chapel', description: 'Daily morning Mass. All are welcome.' },
  { dayOffset: 1, startHour: 18, startMinute: 0, durationMinutes: 90, title: 'Parish Pastoral Council', type: 'meeting', location: 'Parish Office', description: 'Monthly meeting of the Parish Pastoral Council.' },
  { dayOffset: 2, startHour: 7, startMinute: 0, durationMinutes: 60, title: 'Morning Mass', type: 'mass', location: 'Chapel', description: 'Daily morning Mass.' },
  { dayOffset: 2, startHour: 17, startMinute: 0, durationMinutes: 120, title: 'Choir Rehearsal', type: 'meeting', location: 'Parish Hall', description: 'Weekly rehearsal of the parish choir ahead of Sunday Mass.' },
  { dayOffset: 3, startHour: 7, startMinute: 0, durationMinutes: 60, title: 'Morning Mass', type: 'mass', location: 'Chapel', description: 'Daily morning Mass.' },
  { dayOffset: 3, startHour: 16, startMinute: 0, durationMinutes: 90, title: 'Confessions', type: 'confession', location: 'Main Church', description: 'Saturday confessions. Also available by appointment with any priest.' },
  { dayOffset: 4, startHour: 7, startMinute: 0, durationMinutes: 75, title: 'First Mass (Sunday)', type: 'mass', location: 'Chapel', description: 'First Sunday Mass. Begins at the Chapel.' },
  { dayOffset: 4, startHour: 9, startMinute: 0, durationMinutes: 90, title: 'Second Mass (Sunday)', type: 'mass', location: 'Main Church', description: 'Second Sunday Mass with full choir.' },
  { dayOffset: 4, startHour: 11, startMinute: 0, durationMinutes: 60, title: 'RCIA Class', type: 'parish_event', location: 'Parish Hall', description: 'Weekly RCIA catechesis for those becoming Catholic.' },
  { dayOffset: 6, startHour: 18, startMinute: 30, durationMinutes: 90, title: 'Legion of Mary', type: 'meeting', location: 'Room 2, Parish Hall', description: 'Weekly praesidium meeting of the Legion of Mary.' },
  { dayOffset: 8, startHour: 17, startMinute: 0, durationMinutes: 120, title: 'Eucharistic Adoration', type: 'parish_event', location: 'Main Church', description: 'First Friday Eucharistic Adoration, concluding with Benediction.' },
  { dayOffset: 11, startHour: 11, startMinute: 0, durationMinutes: 150, title: 'Corpus Christi Procession', type: 'celebration', location: 'Parish Grounds', description: 'Outdoor Eucharistic Procession after the 11 am Mass with four altars of repose.' },
  { dayOffset: 13, startHour: 9, startMinute: 0, durationMinutes: 480, title: 'Archdiocesan Youth Congress', type: 'celebration', location: 'Holy Cross Cathedral, Lagos', description: 'Annual Archdiocesan Youth Congress. Transportation arranged by the parish.' },
  { dayOffset: 15, startHour: 19, startMinute: 0, durationMinutes: 120, title: 'Ascension Family Prayer', type: 'parish_event', location: 'Main Church Building', description: 'An evening of Eucharistic Adoration, praise and worship for the whole family.' },
];

/** Upcoming events ordered by start time (mocked Google Calendar `events.list`). */
export async function getUpcomingEvents(): Promise<CalendarEvent[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return seeds
    .map((seed, index) => {
      const start = new Date(today);
      start.setDate(start.getDate() + seed.dayOffset);
      start.setHours(seed.startHour, seed.startMinute, 0, 0);
      const end = new Date(start.getTime() + seed.durationMinutes * 60_000);
      return {
        id: `mock-event-${index}`,
        title: seed.title,
        type: seed.type,
        start: start.toISOString(),
        end: end.toISOString(),
        location: seed.location,
        description: seed.description,
      } satisfies CalendarEvent;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}
