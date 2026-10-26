// Deepening the Faith — pure archive helpers. Everything here is a function of
// its inputs ("YYYY-MM-DD" Lagos dates), so it is unit-tested without Sanity;
// the fetch lives in lib/deepeningTheFaith.ts.

import type { PortableTextBlock } from '@portabletext/types';
import { toPlainText } from '@portabletext/react';
import { addDays } from './calendar';
import type { FaithMonth, FaithReflection } from './types';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export interface ArchiveRow {
  date: string;
  reflection: FaithReflection | null;
}

export interface ArchiveMonth {
  /** "YYYY-MM" */
  key: string;
  year: number;
  /** 1–12 */
  month: number;
  name: string;
  /** Has a theme or at least one visible reflection — otherwise dimmed and unselectable. */
  enabled: boolean;
  /** Today's Lagos month. */
  isCurrent: boolean;
  theme: string | null;
  /** Every Sunday of the month, plus any off-Sunday reflection dates, ascending. */
  rows: ArchiveRow[];
}

export interface ArchiveYear {
  year: number;
  months: ArchiveMonth[];
}

export interface FeaturedReflection {
  reflection: FaithReflection;
  theme: string | null;
  /** Dated within the last seven days — "This week" rather than "Latest". */
  isThisWeek: boolean;
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function monthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? '';
}

/** "October 2026" for a "YYYY-MM" key. */
export function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return `${monthName(month ?? 0)} ${year ?? ''}`.trim();
}

/** Every Sunday in the given month as "YYYY-MM-DD", ascending. */
export function sundaysInMonth(year: number, month: number): string[] {
  const first = new Date(Date.UTC(year, month - 1, 1, 12));
  let date = addDays(first.toISOString().slice(0, 10), (7 - first.getUTCDay()) % 7);
  const prefix = monthKey(year, month);
  const sundays: string[] = [];
  while (date.startsWith(prefix)) {
    sundays.push(date);
    date = addDays(date, 7);
  }
  return sundays;
}

/**
 * The archive navigator's data: one entry per year that has content (plus the
 * current year), newest first, each with all twelve months.
 */
export function buildArchive(
  months: FaithMonth[],
  reflections: FaithReflection[],
  today: string,
): ArchiveYear[] {
  const themes = new Map(months.map((m) => [m.key, m.theme]));
  const byMonth = new Map<string, FaithReflection[]>();
  for (const r of reflections) {
    const list = byMonth.get(r.monthKey) ?? [];
    list.push(r);
    byMonth.set(r.monthKey, list);
  }

  const currentKey = today.slice(0, 7);
  const years = new Set<number>([Number(today.slice(0, 4))]);
  for (const key of [...themes.keys(), ...byMonth.keys()]) years.add(Number(key.slice(0, 4)));

  return [...years]
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      months: MONTH_NAMES.map((name, i) => {
        const month = i + 1;
        const key = monthKey(year, month);
        const monthReflections = byMonth.get(key) ?? [];
        const theme = themes.get(key) ?? null;

        const byDate = new Map(monthReflections.map((r) => [r.date, r]));
        const dates = new Set([...sundaysInMonth(year, month), ...byDate.keys()]);
        const rows = [...dates]
          .sort()
          .map((date) => ({ date, reflection: byDate.get(date) ?? null }));

        return {
          key,
          year,
          month,
          name,
          enabled: theme !== null || monthReflections.length > 0,
          isCurrent: key === currentKey,
          theme,
          rows,
        };
      }),
    }));
}

/** The most recent visible reflection, flagged "this week" when it's under 7 days old. */
export function pickFeatured(
  months: FaithMonth[],
  reflections: FaithReflection[],
  today: string,
): FeaturedReflection | null {
  const latest = reflections.reduce<FaithReflection | null>(
    (best, r) => (r.date <= today && (!best || r.date > best.date) ? r : best),
    null,
  );
  if (!latest) return null;
  return {
    reflection: latest,
    theme: months.find((m) => m.key === latest.monthKey)?.theme ?? null,
    isThisWeek: latest.date > addDays(today, -7),
  };
}

/** The month the archive opens on: today's month if it has content, else the latest that does. */
export function defaultMonthKey(archive: ArchiveYear[], today: string): string | null {
  const enabled = archive.flatMap((y) => y.months).filter((m) => m.enabled);
  const current = enabled.find((m) => m.key === today.slice(0, 7));
  if (current) return current.key;
  const past = enabled.filter((m) => m.key <= today.slice(0, 7));
  const pool = past.length > 0 ? past : enabled;
  return pool.reduce<string | null>((best, m) => (!best || m.key > best ? m.key : best), null);
}

// Title abbreviations whose full stop doesn't end a sentence ("St. Francis").
const ABBREVIATIONS = new Set(['st', 'sts', 'mt', 'fr', 'rev', 'dr', 'mr', 'mrs', 'ms', 'jn', 'lk', 'mk']);

/** First sentence of the teaching's first paragraph — the featured card's teaser. */
export function teachingExcerpt(teaching: PortableTextBlock[]): string {
  const [first] = teaching;
  if (!first) return '';
  const text = toPlainText([first]).trim();

  const boundary = /[.!?]["”’']?(?=\s+["“'‘]?[A-Z])/g;
  for (const match of text.matchAll(boundary)) {
    const end = match.index + match[0].length;
    const word = /(\w+)[.!?]["”’']?$/.exec(text.slice(0, end))?.[1]?.toLowerCase();
    if (match[0].startsWith('.') && word && ABBREVIATIONS.has(word)) continue;
    return text.slice(0, end);
  }
  return text;
}
