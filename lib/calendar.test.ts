import { describe, it, expect } from 'vitest';
import {
  expandEvents,
  monthBounds,
  formatDayset,
  getScheduleWeek,
  eventTypeLabel,
  type RecurringEventDoc,
  type ParishEventDoc,
  type ScheduleData,
  type DateRange,
} from './calendar';
import { formatTime } from './format';

// Fixtures use February 2026 — 2026-02-01 is a Sunday, so:
//   Sundays 1, 8, 15, 22 · Mondays 2, 9, 16, 23 · Feb 2026 has 28 days (not leap).
const FEB: DateRange = { from: '2026-02-01', to: '2026-02-28' };

function data(rules: RecurringEventDoc[] = [], oneOffs: ParishEventDoc[] = []): ScheduleData {
  return { rules, oneOffs };
}

function mkRule(o: Partial<RecurringEventDoc> & { _id: string; title: string }): RecurringEventDoc {
  return {
    eventType: 'mass',
    frequency: 'weekly',
    daysOfWeek: ['0'],
    time: '09:00',
    ...o,
  };
}

function mkOneOff(
  o: Partial<ParishEventDoc> & { _id: string; title: string; startDate: string },
): ParishEventDoc {
  return { eventType: 'celebration', ...o };
}

const instant = (date: string, time: string): string =>
  new Date(`${date}T${time}:00+01:00`).toISOString();

const dow = (date: string): number => new Date(`${date}T12:00:00Z`).getUTCDay();

// ---------------------------------------------------------------------------

describe('expandEvents — weekly', () => {
  it('one occurrence per matching weekday, with id / start / end', () => {
    const events = expandEvents(
      data([mkRule({ _id: 'r1', title: 'Sunday Mass', time: '09:00', durationMinutes: 75 })]),
      FEB,
    );
    expect(events.map((e) => e.date)).toEqual([
      '2026-02-01',
      '2026-02-08',
      '2026-02-15',
      '2026-02-22',
    ]);
    const first = events[0]!;
    expect(first.id).toBe('r1#2026-02-01');
    expect(first.start).toBe(instant('2026-02-01', '09:00'));
    expect(first.end).toBe(instant('2026-02-01', '10:15'));
  });

  it('a Mon–Sat rule skips Sundays', () => {
    const events = expandEvents(
      data([mkRule({ _id: 'r', title: 'Daily Mass', daysOfWeek: ['1', '2', '3', '4', '5', '6'], time: '12:00' })]),
      FEB,
    );
    expect(events).toHaveLength(24); // 28 days − 4 Sundays
    expect(events.every((e) => dow(e.date) !== 0)).toBe(true);
  });

  it('range boundaries are inclusive', () => {
    const rule = mkRule({ _id: 'r', title: 'M' });
    expect(expandEvents(data([rule]), { from: '2026-02-08', to: '2026-02-08' }).map((e) => e.date)).toEqual([
      '2026-02-08',
    ]);
    expect(expandEvents(data([rule]), { from: '2026-02-09', to: '2026-02-14' })).toHaveLength(0);
  });
});

describe('expandEvents — monthly', () => {
  it('"first" weekday', () => {
    const rule = mkRule({
      _id: 'r',
      title: 'First Friday',
      frequency: 'monthly',
      monthlyOrdinal: 'first',
      monthlyWeekday: '5',
      time: '17:00',
    });
    expect(expandEvents(data([rule]), FEB).map((e) => e.date)).toEqual(['2026-02-06']);
  });

  it('"last" differs from "fourth" in a five-week month', () => {
    const mar: DateRange = { from: '2026-03-01', to: '2026-03-31' }; // Sundays 1, 8, 15, 22, 29
    const last = mkRule({
      _id: 'l',
      title: 'Last Sun',
      frequency: 'monthly',
      monthlyOrdinal: 'last',
      monthlyWeekday: '0',
      time: '18:00',
    });
    const fourth = mkRule({ ...last, _id: 'f', title: '4th Sun', monthlyOrdinal: 'fourth' });
    expect(expandEvents(data([last]), mar).map((e) => e.date)).toEqual(['2026-03-29']);
    expect(expandEvents(data([fourth]), mar).map((e) => e.date)).toEqual(['2026-03-22']);
  });
});

describe('expandEvents — season bounds', () => {
  it('suppresses occurrences outside [startDate, endDate]', () => {
    const rule = mkRule({
      _id: 'r',
      title: 'Novena',
      time: '18:00',
      startDate: '2026-02-09',
      endDate: '2026-02-16',
    });
    expect(expandEvents(data([rule]), FEB).map((e) => e.date)).toEqual(['2026-02-15']);
  });

  it('returns nothing when the window is entirely outside the season', () => {
    const rule = mkRule({ _id: 'r', title: 'X', startDate: '2026-05-01', endDate: '2026-05-31' });
    expect(expandEvents(data([rule]), FEB)).toHaveLength(0);
  });
});

describe('expandEvents — overrides', () => {
  it('drops a cancelled occurrence, keeps siblings', () => {
    const rule = mkRule({
      _id: 'r',
      title: 'Mass',
      overrides: [{ date: '2026-02-08', mode: 'cancelled' }],
    });
    expect(expandEvents(data([rule]), FEB).map((e) => e.date)).toEqual([
      '2026-02-01',
      '2026-02-15',
      '2026-02-22',
    ]);
  });

  it('applies a modified time / title / location / note', () => {
    const rule = mkRule({
      _id: 'r',
      title: 'Mass',
      location: 'Church',
      overrides: [
        {
          date: '2026-02-08',
          mode: 'modified',
          time: '08:00',
          title: 'Early Mass',
          location: 'Chapel',
          note: 'Moved for the bazaar',
        },
      ],
    });
    const feb8 = expandEvents(data([rule]), FEB).find((e) => e.date === '2026-02-08')!;
    expect(feb8.title).toBe('Early Mass');
    expect(feb8.location).toBe('Chapel');
    expect(feb8.note).toBe('Moved for the bazaar');
    expect(feb8.start).toBe(instant('2026-02-08', '08:00'));
    expect(feb8.id).toBe('r#2026-02-08');
  });
});

describe('expandEvents — follows', () => {
  const mondayAnchor = (o: Partial<RecurringEventDoc> = {}) =>
    mkRule({ _id: 'a', title: 'Anchor', daysOfWeek: ['1'], time: '07:00', ...o });
  const mondayFollower = (relation: 'after' | 'before' | 'during') =>
    mkRule({
      _id: 'f',
      title: 'Follower',
      daysOfWeek: ['1'],
      startMode: 'follows',
      anchorId: 'a',
      anchorRelation: relation,
      time: undefined,
    });

  const monday = (d: ScheduleData) =>
    expandEvents(d, FEB).filter((e) => e.date === '2026-02-02');

  it('"after" with anchor duration starts at the anchor end, glued after it', () => {
    const events = monday(data([mondayAnchor({ durationMinutes: 45 }), mondayFollower('after')]));
    expect(events.map((e) => e.title)).toEqual(['Anchor', 'Follower']);
    expect(events[1]!.start).toBe(events[0]!.end);
    expect(events[1]!.relativeTo).toBe('After Anchor');
  });

  it('"after" without anchor duration sits just after at the same start', () => {
    const events = monday(data([mondayAnchor(), mondayFollower('after')]));
    expect(events.map((e) => e.title)).toEqual(['Anchor', 'Follower']);
    expect(events[1]!.start).toBe(events[0]!.start);
  });

  it('"before" sits immediately before the anchor', () => {
    const events = monday(data([mondayAnchor(), mondayFollower('before')]));
    expect(events.map((e) => e.title)).toEqual(['Follower', 'Anchor']);
    expect(events[0]!.relativeTo).toBe('Before Anchor');
  });

  it('"during" sits immediately after the anchor', () => {
    const events = monday(data([mondayAnchor(), mondayFollower('during')]));
    expect(events.map((e) => e.title)).toEqual(['Anchor', 'Follower']);
  });

  it('drops a follower when its anchor is cancelled that day', () => {
    const anchor = mondayAnchor({ overrides: [{ date: '2026-02-02', mode: 'cancelled' }] });
    expect(monday(data([anchor, mondayFollower('after')]))).toHaveLength(0);
  });

  it('drops a follower on days its anchor rule does not run', () => {
    const anchor = mondayAnchor(); // Mondays only
    const follower = mkRule({
      _id: 'f',
      title: 'Follower',
      daysOfWeek: ['1', '2'], // Mon + Tue
      startMode: 'follows',
      anchorId: 'a',
      anchorRelation: 'after',
      time: undefined,
    });
    const followers = expandEvents(data([anchor, follower]), FEB).filter((e) => e.title === 'Follower');
    expect(followers.every((e) => dow(e.date) === 1)).toBe(true);
  });

  it('stays glued to its anchor even when another event falls between by clock time', () => {
    const anchor = mondayAnchor({ durationMinutes: 75 }); // 07:00–08:15
    const between = mkRule({ _id: 'b', title: 'Rosary', daysOfWeek: ['1'], time: '07:30' });
    const events = monday(data([anchor, between, mondayFollower('after')]));
    expect(events.map((e) => e.title)).toEqual(['Anchor', 'Follower', 'Rosary']);
  });

  it('a one-off event can follow a recurring anchor on the same date', () => {
    const anchor = mkRule({ _id: 'mass', title: 'Sunday Mass', time: '09:00', durationMinutes: 60 });
    const oneOff = mkOneOff({
      _id: 'ycp',
      title: 'YCP Meeting',
      eventType: 'meeting',
      startDate: '2026-02-08',
      startMode: 'follows',
      anchorId: 'mass',
      anchorRelation: 'after',
    });
    const feb8 = expandEvents(data([anchor], [oneOff]), FEB).filter((e) => e.date === '2026-02-08');
    expect(feb8.map((e) => e.title)).toEqual(['Sunday Mass', 'YCP Meeting']);
    expect(feb8[1]!.relativeTo).toBe('After Sunday Mass');
  });

  it('a follows one-off outside the window is excluded', () => {
    const anchor = mkRule({ _id: 'mass', title: 'M', time: '09:00' });
    const oneOff = mkOneOff({
      _id: 'x',
      title: 'X',
      eventType: 'meeting',
      startDate: '2026-03-08',
      startMode: 'follows',
      anchorId: 'mass',
      anchorRelation: 'after',
    });
    expect(expandEvents(data([anchor], [oneOff]), FEB).some((e) => e.title === 'X')).toBe(false);
  });
});

describe('expandEvents — one-offs', () => {
  it('all-day multi-day → one block per day, clipped to the window', () => {
    const oneOff = mkOneOff({
      _id: 'retreat',
      title: 'Retreat',
      startDate: '2026-01-30',
      endDate: '2026-02-02',
      allDay: true,
    });
    const events = expandEvents(data([], [oneOff]), FEB);
    expect(events.map((e) => e.date)).toEqual(['2026-02-01', '2026-02-02']);
    expect(events.every((e) => e.allDay === true)).toBe(true);
    expect(events[0]!.id).toBe('retreat#2026-02-01');
  });

  it('timed multi-day → one occurrence per day at the same clock times', () => {
    const oneOff = mkOneOff({
      _id: 'triduum',
      title: 'Triduum',
      startDate: '2026-02-05',
      endDate: '2026-02-07',
      startTime: '18:00',
      endTime: '20:00',
    });
    const events = expandEvents(data([], [oneOff]), FEB);
    expect(events.map((e) => e.date)).toEqual(['2026-02-05', '2026-02-06', '2026-02-07']);
    for (const e of events) {
      expect(e.id).toBe(`triduum#${e.date}`);
      expect(e.start).toBe(instant(e.date, '18:00'));
      expect(e.end).toBe(instant(e.date, '20:00'));
      expect(e.allDay).toBeUndefined();
    }
  });

  it('single-day timed one-off uses the id "_id#date"', () => {
    const oneOff = mkOneOff({ _id: 'ord', title: 'Ordination', startDate: '2026-02-14', startTime: '10:00' });
    const ev = expandEvents(data([], [oneOff]), FEB)[0]!;
    expect(ev.id).toBe('ord#2026-02-14');
    expect(ev.end).toBeUndefined();
  });

  it('a one-off entirely before the window yields nothing', () => {
    const oneOff = mkOneOff({ _id: 'x', title: 'X', startDate: '2026-01-10', startTime: '10:00' });
    expect(expandEvents(data([], [oneOff]), FEB)).toHaveLength(0);
  });

  it('a past-dated one-off inside a past-month window is still expanded', () => {
    const oneOff = mkOneOff({ _id: 'req', title: 'Requiem', startDate: '2025-11-10', startTime: '10:00' });
    const events = expandEvents(data([], [oneOff]), { from: '2025-11-01', to: '2025-11-30' });
    expect(events.map((e) => e.title)).toEqual(['Requiem']);
  });
});

describe('expandEvents — ordering', () => {
  it('unrelated same-day events sort by start then title', () => {
    const events = expandEvents(
      data([
        mkRule({ _id: 'a', title: 'Zeta', daysOfWeek: ['1'], time: '07:00' }),
        mkRule({ _id: 'b', title: 'Alpha', daysOfWeek: ['1'], time: '07:00' }),
        mkRule({ _id: 'c', title: 'Beta', daysOfWeek: ['1'], time: '18:00' }),
      ]),
      FEB,
    ).filter((e) => e.date === '2026-02-02');
    expect(events.map((e) => e.title)).toEqual(['Alpha', 'Zeta', 'Beta']);
  });

  it('orders before-follower, anchor, after-follower', () => {
    const anchor = mkRule({ _id: 'a', title: 'Mass', daysOfWeek: ['1'], time: '07:00' });
    const before = mkRule({
      _id: 'bf', title: 'Rosary', daysOfWeek: ['1'],
      startMode: 'follows', anchorId: 'a', anchorRelation: 'before', time: undefined,
    });
    const after = mkRule({
      _id: 'af', title: 'Confession', daysOfWeek: ['1'],
      startMode: 'follows', anchorId: 'a', anchorRelation: 'after', time: undefined,
    });
    const events = expandEvents(data([anchor, before, after]), FEB).filter((e) => e.date === '2026-02-02');
    expect(events.map((e) => e.title)).toEqual(['Rosary', 'Mass', 'Confession']);
  });
});

describe('monthBounds', () => {
  it('bounds the current month', () => {
    expect(monthBounds(0, '2026-02-15')).toEqual({ from: '2026-02-01', to: '2026-02-28' });
  });
  it('handles leap February', () => {
    expect(monthBounds(0, '2028-02-10')).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });
  it('handles negative and multi-month offsets across year boundaries', () => {
    expect(monthBounds(-1, '2026-01-10')).toEqual({ from: '2025-12-01', to: '2025-12-31' });
    expect(monthBounds(3, '2026-11-20')).toEqual({ from: '2027-02-01', to: '2027-02-28' });
  });
});

describe('formatDayset', () => {
  it.each<[number[], string]>([
    [[0], 'Sundays'],
    [[3], 'Wednesdays'],
    [[1, 2, 3, 4, 5], 'Weekdays'],
    [[1, 2, 3, 4, 5, 6], 'Mon–Sat'],
    [[0, 1, 2, 3, 4, 5, 6], 'Daily'],
    [[1, 2, 3], 'Mon–Wed'],
    [[2, 4], 'Tue & Thu'],
    [[1, 3, 5], 'Mon, Wed & Fri'],
    [[4, 2, 4], 'Tue & Thu'],
    [[], ''],
  ])('%j → %s', (dows, label) => {
    expect(formatDayset(dows)).toBe(label);
  });
});

describe('getScheduleWeek', () => {
  const first = mkRule({ _id: 's1', title: 'First Mass', daysOfWeek: ['0'], time: '07:00', durationMinutes: 60 });
  const second = mkRule({ _id: 's2', title: 'Second Mass', daysOfWeek: ['0'], time: '09:00', durationMinutes: 90 });
  const midday = mkRule({ _id: 'wm', title: 'Midday Mass', daysOfWeek: ['1', '2', '3', '4', '5', '6'], time: '12:00' });
  const morning = mkRule({ _id: 'mm', title: 'Morning Mass', daysOfWeek: ['1', '2', '3', '4', '5', '6'], time: '07:00' });

  const t7 = formatTime(instant('2026-02-08', '07:00'));
  const t9 = formatTime(instant('2026-02-08', '09:00'));
  const t12 = formatTime(instant('2026-02-08', '12:00'));
  const t16 = formatTime(instant('2026-02-07', '16:00'));

  it("the coming Sunday's masses go in sundayMasses (title + time), not weekdayMasses", () => {
    const week = getScheduleWeek(data([first, second, midday]), '2026-02-04'); // Wednesday
    expect(week.sundayMasses).toEqual([
      { label: 'Sundays', title: 'First Mass', time: t7 },
      { label: 'Sundays', title: 'Second Mass', time: t9 },
    ]);
    expect(week.sundayLabel).toMatch(/^This Sunday · \d{1,2} \w{3}$/);
    expect(week.weekdayMasses.some((m) => m.title === 'First Mass')).toBe(false);
  });

  it('collapses weekday masses by (title, time) with a day-range label, time-sorted', () => {
    const week = getScheduleWeek(data([midday, morning]), '2026-02-04');
    expect(week.weekdayMasses).toEqual([
      { label: 'Mon–Sat', title: 'Morning Mass', time: t7 },
      { label: 'Mon–Sat', title: 'Midday Mass', time: t12 },
    ]);
  });

  it('when today is Sunday, the coming Sunday is today', () => {
    const week = getScheduleWeek(data([second, midday]), '2026-02-08');
    expect(week.sundayMasses).toEqual([{ label: 'Sundays', title: 'Second Mass', time: t9 }]);
    expect(week.weekdayMasses.every((m) => m.title !== 'Second Mass')).toBe(true);
  });

  it('describes a fixed Saturday confession by day pattern + time', () => {
    const conf = mkRule({ _id: 'c', title: 'Confessions', eventType: 'confession', daysOfWeek: ['6'], time: '16:00' });
    const week = getScheduleWeek(data([conf]), '2026-02-04');
    expect(week.confession).toEqual({ label: 'Saturdays', title: 'Confessions', time: t16 });
  });

  it('describes a follows confession with its relation phrase', () => {
    const mass = mkRule({ _id: 'm', title: 'Midday Mass', daysOfWeek: ['1', '2', '3', '4', '5'], time: '12:00' });
    const conf = mkRule({
      _id: 'c', title: 'Confessions', eventType: 'confession', daysOfWeek: ['1', '2', '3', '4', '5'],
      startMode: 'follows', anchorId: 'm', anchorRelation: 'after', time: undefined,
    });
    const week = getScheduleWeek(data([mass, conf]), '2026-02-04');
    expect(week.confession).toEqual({
      label: 'Weekdays',
      title: 'Confessions',
      time: 'after Midday Mass',
    });
  });

  it('confession is null when there is none in the window', () => {
    const week = getScheduleWeek(data([midday]), '2026-02-04');
    expect(week.confession).toBeNull();
  });

  it('handles empty data without throwing', () => {
    const week = getScheduleWeek(data(), '2026-02-04');
    expect(week.sundayMasses).toEqual([]);
    expect(week.weekdayMasses).toEqual([]);
    expect(week.confession).toBeNull();
  });
});

describe('eventTypeLabel', () => {
  it.each<[Parameters<typeof eventTypeLabel>[0], string]>([
    ['mass', 'Mass'],
    ['confession', 'Confession'],
    ['parish_event', 'Parish Event'],
    ['meeting', 'Meeting'],
    ['celebration', 'Special Celebration'],
  ])('%s → %s', (type, label) => {
    expect(eventTypeLabel(type)).toBe(label);
  });
});
