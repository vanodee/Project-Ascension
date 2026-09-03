import type { CalendarEvent, CalendarEventType } from './types';
import { formatDayMonth, formatTime } from './format';

// Parish schedule — managed in Sanity (see CLAUDE.md). Two document types:
//   recurringEvent — a repeating rule + per-date exceptions
//   parishEvent    — a single dated event (may span multiple days / be all-day)
//
// This module is pure and client-safe: the Sanity fetch lives in `lib/schedule.ts`.
// `expandEvents(data, { from, to })` turns the rules + one-offs into concrete
// occurrences for an arbitrary date window — the schedule page runs it for
// whichever month is on screen. An event's start is either a fixed clock time or
// "follows" another event (after / before / during); following events are
// resolved in a second pass, once every fixed occurrence in the window is known.

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

const ORDINALS = { first: 1, second: 2, third: 3, fourth: 4 } as const;

// ---------------------------------------------------------------------------
// Date helpers — all schedule times are Lagos wall-clock (UTC+1, no DST).
// Everything here is a pure function of its "YYYY-MM-DD" / "HH:MM" inputs.
// ---------------------------------------------------------------------------

/** Add whole days to a "YYYY-MM-DD" string (noon-UTC anchor avoids offset edges). */
export function addDays(dateStr: string, n: number): string {
  const t = new Date(`${dateStr}T12:00:00Z`).getTime() + n * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/** Day of week for a "YYYY-MM-DD" string, 0 = Sunday. */
function weekdayOf(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay();
}

/** Combine a Lagos date + "HH:MM" into an ISO instant. */
function lagosInstant(dateStr: string, time: string): string {
  return new Date(`${dateStr}T${time}:00+01:00`).toISOString();
}

/** ISO instant `minutes` after `start`, or undefined when there is no duration. */
function endInstant(start: string, minutes: number | undefined): string | undefined {
  return minutes && minutes > 0
    ? new Date(new Date(start).getTime() + minutes * 60_000).toISOString()
    : undefined;
}

/** The date of the Nth given weekday in a month, or null if it doesn't exist. */
function nthWeekdayDate(
  year: number,
  month0: number,
  ordinal: string,
  weekday: number,
): string | null {
  const iso = (d: Date): string => d.toISOString().slice(0, 10);

  if (ordinal === 'last') {
    const d = new Date(Date.UTC(year, month0 + 1, 0, 12));
    while (d.getUTCDay() !== weekday) d.setUTCDate(d.getUTCDate() - 1);
    return iso(d);
  }

  const n = ORDINALS[ordinal as keyof typeof ORDINALS];
  if (!n) return null;
  const d = new Date(Date.UTC(year, month0, 1, 12));
  while (d.getUTCDay() !== weekday) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCDate(d.getUTCDate() + (n - 1) * 7);
  return d.getUTCMonth() === month0 ? iso(d) : null;
}

/** Inclusive first/last "YYYY-MM-DD" of the month `offset` months from `today`. */
export function monthBounds(offset: number, today: string): DateRange {
  const base = new Date(`${today}T12:00:00Z`);
  const y = base.getUTCFullYear();
  const m = base.getUTCMonth() + offset;
  const first = new Date(Date.UTC(y, m, 1, 12));
  const last = new Date(Date.UTC(y, m + 1, 0, 12));
  return { from: first.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10) };
}

// ---------------------------------------------------------------------------
// Sanity document shapes
// ---------------------------------------------------------------------------

type StartMode = 'fixed' | 'follows';
type AnchorRelation = 'after' | 'before' | 'during';

export interface OverrideDoc {
  date: string;
  mode: 'cancelled' | 'modified';
  time?: string;
  location?: string;
  title?: string;
  note?: string;
}

export interface RecurringEventDoc {
  _id: string;
  title: string;
  eventType: CalendarEventType;
  location?: string;
  description?: string;
  frequency: 'weekly' | 'monthly';
  daysOfWeek?: string[];
  monthlyOrdinal?: string;
  monthlyWeekday?: string;
  startMode?: StartMode;
  anchorId?: string | null;
  anchorRelation?: AnchorRelation;
  time?: string;
  durationMinutes?: number;
  startDate?: string;
  endDate?: string;
  overrides?: OverrideDoc[];
}

export interface ParishEventDoc {
  _id: string;
  title: string;
  eventType: CalendarEventType;
  location?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  startMode?: StartMode;
  anchorId?: string | null;
  anchorRelation?: AnchorRelation;
  startTime?: string;
  endTime?: string;
}

/** Everything the schedule needs from Sanity — fetched by `lib/schedule.ts`. */
export interface ScheduleData {
  rules: RecurringEventDoc[];
  oneOffs: ParishEventDoc[];
}

/** An inclusive "YYYY-MM-DD" window. */
export interface DateRange {
  from: string;
  to: string;
}

// ---------------------------------------------------------------------------
// Expansion
// ---------------------------------------------------------------------------

const RELATION_WORD: Record<AnchorRelation, string> = {
  after: 'After',
  before: 'Before',
  during: 'During',
};

/** An event plus the metadata needed to place it in the final ordering. */
interface Ranked {
  event: CalendarEvent;
  /** -1 sorts a "before" event ahead of its anchor; +1 sorts "during"/open-ended "after" behind it. */
  rank: number;
  /** For a following event: the `id` of the anchor occurrence it should sit next to. */
  attachTo?: string;
  relation?: AnchorRelation;
}

/** Does a recurring rule fall on this date (pattern + season bounds)? */
function matchesRecurring(rule: RecurringEventDoc, date: string, weekday: number): boolean {
  if (rule.startDate && date < rule.startDate) return false;
  if (rule.endDate && date > rule.endDate) return false;

  return rule.frequency === 'weekly'
    ? (rule.daysOfWeek ?? []).includes(String(weekday))
    : rule.monthlyOrdinal !== undefined &&
        rule.monthlyWeekday !== undefined &&
        date ===
          nthWeekdayDate(
            Number(date.slice(0, 4)),
            Number(date.slice(5, 7)) - 1,
            rule.monthlyOrdinal,
            Number(rule.monthlyWeekday),
          );
}

/** Build the fixed-time occurrence of a recurring rule on a matching date, or null if cancelled. */
function materializeRecurring(rule: RecurringEventDoc, date: string): CalendarEvent | null {
  const override = rule.overrides?.find((o) => o.date === date);
  if (override?.mode === 'cancelled') return null;
  const modified = override?.mode === 'modified' ? override : undefined;

  const time = modified?.time || rule.time;
  if (!time) return null; // a fixed rule with no time is misconfigured — skip it

  const start = lagosInstant(date, time);
  const end = endInstant(start, rule.durationMinutes);

  const event: CalendarEvent = {
    id: `${rule._id}#${date}`,
    title: modified?.title || rule.title,
    type: rule.eventType,
    date,
    start,
    location: modified?.location || rule.location || '',
    description: rule.description ?? '',
  };
  if (end) event.end = end;
  if (modified?.note) event.note = modified.note;
  return event;
}

/**
 * Concrete occurrences of a fixed-time one-off, one per day it spans, clipped to
 * `[from, to]`. A multi-day timed event repeats its start/end clock times on
 * every day of the range; a multi-day all-day event is one all-day block per day.
 */
function expandOneOff(doc: ParishEventDoc, from: string, to: string): CalendarEvent[] {
  const spanLast = doc.endDate && doc.endDate > doc.startDate ? doc.endDate : doc.startDate;
  const first = doc.startDate < from ? from : doc.startDate;
  const last = spanLast > to ? to : spanLast;
  if (first > last) return [];

  const out: CalendarEvent[] = [];
  for (let date = first; date <= last; date = addDays(date, 1)) {
    if (doc.allDay) {
      out.push({
        id: `${doc._id}#${date}`,
        title: doc.title,
        type: doc.eventType,
        date,
        start: lagosInstant(date, '00:00'),
        end: lagosInstant(date, '23:59'),
        location: doc.location ?? '',
        description: doc.description ?? '',
        allDay: true,
      });
      continue;
    }

    const event: CalendarEvent = {
      id: `${doc._id}#${date}`,
      title: doc.title,
      type: doc.eventType,
      date,
      start: lagosInstant(date, doc.startTime ?? '00:00'),
      location: doc.location ?? '',
      description: doc.description ?? '',
    };
    if (doc.endTime) event.end = lagosInstant(date, doc.endTime);
    out.push(event);
  }
  return out;
}

interface FollowResult {
  start: string;
  rank: number;
  relativeTo: string;
}

/** Resolve a following event's start + sort rank against its anchor occurrence. */
function resolveFollow(
  anchor: CalendarEvent,
  relation: AnchorRelation,
  overrideTime: string | undefined,
  date: string,
): FollowResult {
  const relativeTo = `${RELATION_WORD[relation]} ${anchor.title}`;

  // A "modified" exception can still pin a fixed time for one date.
  if (overrideTime) {
    return { start: lagosInstant(date, overrideTime), rank: 0, relativeTo };
  }
  if (relation === 'after') {
    return anchor.end
      ? { start: anchor.end, rank: 0, relativeTo }
      : { start: anchor.start, rank: 1, relativeTo }; // no anchor end — sit just behind it
  }
  if (relation === 'before') {
    return { start: anchor.start, rank: -1, relativeTo };
  }
  // during — starts with the anchor, listed just behind it
  return { start: anchor.start, rank: 1, relativeTo };
}

/**
 * Expand the schedule into concrete occurrences within `range` (inclusive).
 * Pure and deterministic — no wall-clock reads.
 */
export function expandEvents(data: ScheduleData, range: DateRange): CalendarEvent[] {
  const { from, to } = range;
  const { rules, oneOffs } = data;

  const fixedRules = rules.filter((r) => r.startMode !== 'follows');
  const followRules = rules.filter((r) => r.startMode === 'follows');
  // An all-day event is always fixed, whatever its (stale) startMode says.
  const fixedOneOffs = oneOffs.filter((d) => d.allDay || d.startMode !== 'follows');
  const followOneOffs = oneOffs.filter((d) => d.startMode === 'follows' && !d.allDay);

  const ranked: Ranked[] = [];

  // sourceId -> "YYYY-MM-DD" -> occurrence. Only fixed occurrences are indexed;
  // an anchor must be a fixed-time event, so following events never chain.
  const bySource = new Map<string, Map<string, CalendarEvent>>();
  const record = (sourceId: string, event: CalendarEvent): void => {
    const byDate = bySource.get(sourceId) ?? new Map<string, CalendarEvent>();
    byDate.set(event.date, event);
    bySource.set(sourceId, byDate);
  };

  // ---- Pass 1: fixed recurring occurrences ----
  for (let date = from; date <= to; date = addDays(date, 1)) {
    const weekday = weekdayOf(date);
    for (const rule of fixedRules) {
      if (!matchesRecurring(rule, date, weekday)) continue;
      const event = materializeRecurring(rule, date);
      if (!event) continue;
      ranked.push({ event, rank: 0 });
      record(rule._id, event);
    }
  }

  // ---- Pass 1: fixed one-off events ----
  for (const doc of fixedOneOffs) {
    for (const event of expandOneOff(doc, from, to)) {
      ranked.push({ event, rank: 0 });
      record(doc._id, event);
    }
  }

  // Anchor lookup: indexed first, then recomputed on demand as a safety path.
  const anchorOn = (id: string | null | undefined, date: string): CalendarEvent | null => {
    if (!id) return null;
    const cached = bySource.get(id)?.get(date);
    if (cached) return cached;
    const rule = fixedRules.find((r) => r._id === id);
    if (rule && matchesRecurring(rule, date, weekdayOf(date))) {
      return materializeRecurring(rule, date);
    }
    const oneOff = fixedOneOffs.find((d) => d._id === id);
    return oneOff ? (expandOneOff(oneOff, date, date).find((e) => e.date === date) ?? null) : null;
  };

  // ---- Pass 2: recurring events that follow another event ----
  for (const rule of followRules) {
    for (let date = from; date <= to; date = addDays(date, 1)) {
      if (!matchesRecurring(rule, date, weekdayOf(date))) continue;

      const override = rule.overrides?.find((o) => o.date === date);
      if (override?.mode === 'cancelled') continue;
      const modified = override?.mode === 'modified' ? override : undefined;

      const anchor = anchorOn(rule.anchorId, date);
      if (!anchor) continue; // anchor not scheduled this date — skip

      const followed = resolveFollow(anchor, rule.anchorRelation ?? 'after', modified?.time, date);
      const end = endInstant(followed.start, rule.durationMinutes);

      const event: CalendarEvent = {
        id: `${rule._id}#${date}`,
        title: modified?.title || rule.title,
        type: rule.eventType,
        date,
        start: followed.start,
        location: modified?.location || rule.location || '',
        description: rule.description ?? '',
        relativeTo: followed.relativeTo,
      };
      if (end) event.end = end;
      if (modified?.note) event.note = modified.note;
      ranked.push({
        event,
        rank: followed.rank,
        attachTo: anchor.id,
        relation: rule.anchorRelation ?? 'after',
      });
    }
  }

  // ---- Pass 2: one-off events that follow another event ----
  for (const doc of followOneOffs) {
    const date = doc.startDate;
    if (date < from || date > to) continue;

    const anchor = anchorOn(doc.anchorId, date);
    if (!anchor) continue;

    const followed = resolveFollow(anchor, doc.anchorRelation ?? 'after', undefined, date);
    const event: CalendarEvent = {
      id: doc._id,
      title: doc.title,
      type: doc.eventType,
      date,
      start: followed.start,
      location: doc.location ?? '',
      description: doc.description ?? '',
      relativeTo: followed.relativeTo,
    };
    if (doc.endTime) event.end = lagosInstant(date, doc.endTime);
    ranked.push({
      event,
      rank: followed.rank,
      attachTo: anchor.id,
      relation: doc.anchorRelation ?? 'after',
    });
  }

  // Order: anchors (and every other non-following event) sort by start instant;
  // a following event is glued to its anchor — directly before it ("before") or
  // directly after it ("after"/"during") — regardless of the clock time it
  // resolves to, so it never drifts away behind unrelated events.
  const anchors = ranked.filter((r) => !r.attachTo);
  const followers = ranked.filter((r) => r.attachTo);

  anchors.sort(
    (a, b) =>
      a.event.start.localeCompare(b.event.start) ||
      a.rank - b.rank ||
      a.event.title.localeCompare(b.event.title),
  );

  const anchorIndex = new Map<string, number>();
  anchors.forEach((a, i) => anchorIndex.set(a.event.id, i));

  interface Placed {
    event: CalendarEvent;
    major: number;
    minor: number;
  }
  const placed: Placed[] = [
    ...anchors.map((a, i): Placed => ({ event: a.event, major: i, minor: 0 })),
    ...followers.map((f): Placed => {
      // Anchor is normally in `anchors`; fall back to its start position if the
      // anchor occurrence somehow isn't indexed.
      const known = anchorIndex.get(f.attachTo ?? '');
      const major =
        known ?? anchors.filter((a) => a.event.start <= f.event.start).length;
      return { event: f.event, major, minor: f.relation === 'before' ? -1 : 1 };
    }),
  ];

  placed.sort(
    (a, b) =>
      a.major - b.major ||
      a.minor - b.minor ||
      a.event.start.localeCompare(b.event.start) ||
      a.event.title.localeCompare(b.event.title),
  );

  return placed
    .map((p) => p.event)
    .filter((event) => event.date >= from && event.date <= to);
}

// ---------------------------------------------------------------------------
// Week-at-a-glance — the "This Sunday" / "This Week" blocks on the homepage,
// contact, and livestream pages. Derived from `expandEvents`, never raw rules,
// so overrides and season bounds are respected.
// ---------------------------------------------------------------------------

const DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOW_PLURAL = [
  'Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays',
];

/** A human label for a set of weekday indices: "Sundays", "Weekdays", "Mon–Sat", "Tue & Thu". */
export function formatDayset(dows: number[]): string {
  const days = [...new Set(dows)].sort((a, b) => a - b);
  if (days.length === 0) return '';
  if (days.length === 7) return 'Daily';
  if (days.length === 5 && days.every((d, i) => d === i + 1)) return 'Weekdays';
  if (days.length === 1) return DOW_PLURAL[days[0]!] ?? '';

  const contiguous = days.every((d, i) => i === 0 || d === days[i - 1]! + 1);
  if (contiguous && days.length >= 3) {
    return `${DOW_SHORT[days[0]!] ?? ''}–${DOW_SHORT[days[days.length - 1]!] ?? ''}`;
  }

  const names = days.map((d) => DOW_SHORT[d] ?? '');
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

/** One schedule line: a day pattern + the event's title + when it happens. */
export interface ScheduleWeekEntry {
  /** Day pattern the entry runs on, e.g. "Sundays", "Mon–Sat", "Saturdays". */
  label: string;
  title: string;
  /** A clock time ("7:00 am") or, for a follows event, a phrase ("after Weekday Mass"). */
  time: string;
}

export interface ScheduleWeek {
  /** e.g. "This Sunday · 7 Sep". */
  sundayLabel: string;
  sundayMasses: ScheduleWeekEntry[];
  weekdayMasses: ScheduleWeekEntry[];
  confession: ScheduleWeekEntry | null;
}

function lowerFirst(s: string): string {
  return s ? s[0]!.toLowerCase() + s.slice(1) : s;
}

/** The "when" of a week entry — a follows event reads as its relation phrase. */
function whenLabel(e: CalendarEvent): string {
  return e.relativeTo ? lowerFirst(e.relativeTo) : formatTime(e.start);
}

/**
 * A week-at-a-glance view of the schedule, derived from `expandEvents` (never raw
 * rules — overrides and season bounds are respected): the coming Sunday's Masses,
 * the next 7 days' weekday Masses collapsed by (title, time), and the next
 * Confession. Each page picks the blocks it shows.
 */
export function getScheduleWeek(data: ScheduleData, today: string): ScheduleWeek {
  const wd = weekdayOf(today);
  const comingSunday = wd === 0 ? today : addDays(today, 7 - wd);

  const sundayMasses = expandEvents(data, { from: comingSunday, to: comingSunday })
    .filter((e) => e.type === 'mass')
    .map((e): ScheduleWeekEntry => ({ label: 'Sundays', title: e.title, time: whenLabel(e) }));

  const weekEvents = expandEvents(data, { from: today, to: addDays(today, 6) });

  // Weekday (non-Sunday) Masses, grouped by (title, time), collapsed to a day label.
  const groups = new Map<
    string,
    { title: string; time: string; at: string; dows: Set<number> }
  >();
  for (const e of weekEvents) {
    if (e.type !== 'mass' || weekdayOf(e.date) === 0) continue;
    const time = whenLabel(e);
    const key = `${e.title}|${time}`;
    const g =
      groups.get(key) ?? { title: e.title, time, at: e.start.slice(11, 16), dows: new Set<number>() };
    g.dows.add(weekdayOf(e.date));
    groups.set(key, g);
  }
  const weekdayMasses = [...groups.values()]
    .sort((a, b) => a.at.localeCompare(b.at) || a.title.localeCompare(b.title))
    .map((g): ScheduleWeekEntry => ({ label: formatDayset([...g.dows]), title: g.title, time: g.time }));

  const confEvents = weekEvents.filter((e) => e.type === 'confession');
  const firstConf = confEvents[0];
  const confession: ScheduleWeekEntry | null = firstConf
    ? {
        label: formatDayset(confEvents.map((e) => weekdayOf(e.date))),
        title: firstConf.title,
        time: whenLabel(firstConf),
      }
    : null;

  return {
    sundayLabel: `This Sunday · ${formatDayMonth(`${comingSunday}T12:00:00+01:00`)}`,
    sundayMasses,
    weekdayMasses,
    confession,
  };
}
