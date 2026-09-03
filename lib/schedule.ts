import 'server-only';
import { client } from '@/sanity/lib/client';
import { RECURRING_EVENTS_QUERY, PARISH_EVENTS_QUERY } from '@/sanity/lib/queries';
import { secondsUntilMidnight } from '@/lib/format';
import { addDays } from '@/lib/calendar';
import type { ScheduleData, RecurringEventDoc, ParishEventDoc } from '@/lib/calendar';

// How far back one-off events are fetched. Recurring occurrences are rules-driven
// and unbounded; only the one-off list needs a floor to stay lean (~13 months, so
// "this month last year" is fully visible when navigating backwards).
const HISTORY_DAYS = 400;

/** Today in Lagos as "YYYY-MM-DD". The only wall-clock read in the schedule pipeline. */
export function getLagosToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
}

/**
 * Fetch the raw schedule documents. The client expands them per-month via
 * `expandEvents`. Both fetches expire from the Data Cache at the next Lagos
 * midnight so date-relative views turn over with the day (`useCdn: false` avoids
 * the CDN edge + Data Cache double-caching that value).
 */
export async function getScheduleData(today: string): Promise<ScheduleData> {
  const historyFrom = addDays(today, -HISTORY_DAYS);
  const opts = { useCdn: false, next: { revalidate: secondsUntilMidnight() } };

  const [rules, oneOffs] = await Promise.all([
    client.fetch<RecurringEventDoc[]>(RECURRING_EVENTS_QUERY, {}, opts),
    client.fetch<ParishEventDoc[]>(PARISH_EVENTS_QUERY, { historyFrom }, opts),
  ]);

  return { rules, oneOffs };
}
