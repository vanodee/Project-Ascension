import type { LiturgicalSeason } from './types';

export type SundayCycle = 'A' | 'B' | 'C';
export type WeekdayCycle = 'I' | 'II';

// Anonymous Gregorian algorithm (Butcher/Meeus) — returns Easter Sunday as UTC midnight.
export function computeEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month, day));
}

// First Sunday of Advent for a given calendar year.
// Advent begins the Sunday nearest to Nov 30 (falls between Nov 27–Dec 3).
function firstSundayOfAdvent(year: number): Date {
  const nov30 = new Date(Date.UTC(year, 10, 30));
  const dow = nov30.getUTCDay(); // 0 = Sunday
  // If Sun–Wed, roll back to that Sunday; if Thu–Sat, roll forward to next Sunday.
  const offset = dow <= 3 ? -dow : 7 - dow;
  return new Date(Date.UTC(year, 10, 30 + offset));
}

// Feast of the Baptism of the Lord = first Sunday after January 6.
function baptismOfTheLord(year: number): Date {
  const jan6 = new Date(Date.UTC(year, 0, 6));
  const dow = jan6.getUTCDay();
  const daysToSunday = dow === 0 ? 7 : 7 - dow;
  return new Date(Date.UTC(year, 0, 6 + daysToSunday));
}

// Derive the liturgical season for a given UTC date.
// All comparisons are UTC-day-level (callers pass a date adjusted for Lagos UTC+1).
export function getLiturgicalSeason(date: Date): LiturgicalSeason {
  const year = date.getUTCFullYear();
  const t = date.getTime();

  const easter = computeEaster(year);
  const ashWednesday = new Date(easter.getTime() - 46 * 86_400_000);
  const pentecost = new Date(easter.getTime() + 49 * 86_400_000);

  if (t >= ashWednesday.getTime() && t < easter.getTime()) return 'Lent';
  if (t >= easter.getTime() && t <= pentecost.getTime()) return 'Easter';

  const adventStart = firstSundayOfAdvent(year);
  const dec24 = new Date(Date.UTC(year, 11, 24));
  if (t >= adventStart.getTime() && t <= dec24.getTime()) return 'Advent';

  // Christmas: Dec 25 of this year onward, or Jan 1 through Baptism of the Lord.
  const dec25 = new Date(Date.UTC(year, 11, 25));
  if (t >= dec25.getTime()) return 'Christmas';

  const botl = baptismOfTheLord(year);
  if (t <= botl.getTime()) return 'Christmas'; // Jan 1–BOTL of this year

  return 'Ordinary Time';
}

// Liturgical year number: same as calendar year, except dates in Advent of year Y
// belong to liturgical year Y+1 (i.e., the year in which Easter will fall).
function liturgicalYear(date: Date): number {
  const year = date.getUTCFullYear();
  return date.getTime() >= firstSundayOfAdvent(year).getTime() ? year + 1 : year;
}

// Sunday lectionary cycle (A/B/C) keyed to the liturgical year.
// 2026 % 3 === 1 → A, 2027 % 3 === 2 → B, 2028 % 3 === 0 → C.
export function getSundayCycle(date: Date): SundayCycle {
  const rem = liturgicalYear(date) % 3;
  if (rem === 1) return 'A';
  if (rem === 2) return 'B';
  return 'C';
}

// Weekday lectionary cycle: odd calendar years = I, even = II.
export function getWeekdayCycle(date: Date): WeekdayCycle {
  return date.getUTCFullYear() % 2 === 1 ? 'I' : 'II';
}

// CSS custom-property name for the liturgical colour token defined in _tokens.scss.
export function getLiturgicalColourVar(season: LiturgicalSeason): string {
  const map: Record<LiturgicalSeason, string> = {
    Advent: '--liturgical-advent',
    Lent: '--liturgical-lent',
    Christmas: '--liturgical-christmas',
    Easter: '--liturgical-easter',
    'Ordinary Time': '--liturgical-ordinary',
  };
  return map[season];
}
