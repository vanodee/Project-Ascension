import { describe, it, expect } from 'vitest';
import type { PortableTextBlock } from '@portabletext/types';
import {
  sundaysInMonth,
  buildArchive,
  pickFeatured,
  defaultMonthKey,
  teachingExcerpt,
  monthLabel,
} from './faithArchive';
import type { FaithMonth, FaithReflection } from './types';

// Fixtures use October 2026 — Sundays 4, 11, 18, 25.

function block(text: string): PortableTextBlock {
  return {
    _type: 'block',
    _key: text.slice(0, 8),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 's', text, marks: [] }],
  };
}

function mkReflection(date: string, o: Partial<FaithReflection> = {}): FaithReflection {
  return {
    slug: `reflection-${date}`,
    date,
    monthKey: date.slice(0, 7),
    topic: `Topic ${date}`,
    biblicalReferences: ['John 1:1'],
    questions: [],
    teaching: [block('A teaching.')],
    suggestedTask: 'Pray.',
    ...o,
  };
}

const OCT: FaithMonth = { key: '2026-10', year: 2026, month: 10, theme: 'Saint Francis' };

describe('sundaysInMonth', () => {
  it('lists every Sunday in the month', () => {
    expect(sundaysInMonth(2026, 10)).toEqual(['2026-10-04', '2026-10-11', '2026-10-18', '2026-10-25']);
  });

  it('handles a month starting on a Sunday and five-Sunday months', () => {
    expect(sundaysInMonth(2026, 2)).toEqual(['2026-02-01', '2026-02-08', '2026-02-15', '2026-02-22']);
    expect(sundaysInMonth(2026, 11)).toEqual([
      '2026-11-01',
      '2026-11-08',
      '2026-11-15',
      '2026-11-22',
      '2026-11-29',
    ]);
  });
});

describe('buildArchive', () => {
  const today = '2026-10-26';

  it('always includes the current year with twelve months', () => {
    const archive = buildArchive([], [], today);
    expect(archive.map((y) => y.year)).toEqual([2026]);
    expect(archive[0]?.months).toHaveLength(12);
    expect(archive[0]?.months.every((m) => !m.enabled)).toBe(true);
  });

  it('enables months with a theme or a reflection and flags the current month', () => {
    const archive = buildArchive([OCT], [mkReflection('2026-09-06')], today);
    const months = archive[0]?.months ?? [];
    expect(months.filter((m) => m.enabled).map((m) => m.key)).toEqual(['2026-09', '2026-10']);
    expect(months.find((m) => m.isCurrent)?.key).toBe('2026-10');
    expect(months.find((m) => m.key === '2026-10')?.theme).toBe('Saint Francis');
    expect(months.find((m) => m.key === '2026-09')?.theme).toBeNull();
  });

  it('lists every Sunday, with null for those awaiting a write-up', () => {
    const archive = buildArchive([OCT], [mkReflection('2026-10-04'), mkReflection('2026-10-18')], today);
    const oct = archive[0]?.months.find((m) => m.key === '2026-10');
    expect(oct?.rows.map((r) => [r.date, r.reflection?.slug ?? null])).toEqual([
      ['2026-10-04', 'reflection-2026-10-04'],
      ['2026-10-11', null],
      ['2026-10-18', 'reflection-2026-10-18'],
      ['2026-10-25', null],
    ]);
  });

  it('merges off-Sunday reflections into the date order', () => {
    const archive = buildArchive([OCT], [mkReflection('2026-10-07')], today);
    const oct = archive[0]?.months.find((m) => m.key === '2026-10');
    expect(oct?.rows.map((r) => r.date)).toEqual([
      '2026-10-04',
      '2026-10-07',
      '2026-10-11',
      '2026-10-18',
      '2026-10-25',
    ]);
  });

  it('adds past years that have content, newest first', () => {
    const archive = buildArchive([{ ...OCT, key: '2025-10', year: 2025 }], [], today);
    expect(archive.map((y) => y.year)).toEqual([2026, 2025]);
  });
});

describe('pickFeatured', () => {
  const reflections = [mkReflection('2026-10-18'), mkReflection('2026-10-25'), mkReflection('2026-10-11')];

  it('picks the latest reflection and its month theme', () => {
    const featured = pickFeatured([OCT], reflections, '2026-10-26');
    expect(featured?.reflection.date).toBe('2026-10-25');
    expect(featured?.theme).toBe('Saint Francis');
    expect(featured?.isThisWeek).toBe(true);
  });

  it('is "this week" for six days after the date, then just "latest"', () => {
    expect(pickFeatured([OCT], reflections, '2026-10-31')?.isThisWeek).toBe(true);
    expect(pickFeatured([OCT], reflections, '2026-11-01')?.isThisWeek).toBe(false);
  });

  it('keeps Sunday’s reflection featured all week, turning over on the next Sunday', () => {
    const withNext = [...reflections, mkReflection('2026-11-01')];
    // Saturday 31 Oct — the 1 Nov write-up is already published but not yet due.
    expect(pickFeatured([OCT], withNext, '2026-10-31')?.reflection.date).toBe('2026-10-25');
    // Sunday 1 Nov (from Lagos midnight) — the new week's reflection takes over.
    expect(pickFeatured([OCT], withNext, '2026-11-01')?.reflection.date).toBe('2026-11-01');
    expect(pickFeatured([OCT], withNext, '2026-11-01')?.isThisWeek).toBe(true);
  });

  it('never features a reflection dated after today', () => {
    expect(pickFeatured([OCT], reflections, '2026-10-20')?.reflection.date).toBe('2026-10-18');
  });

  it('returns null with no reflections', () => {
    expect(pickFeatured([OCT], [], '2026-10-26')).toBeNull();
  });
});

describe('defaultMonthKey', () => {
  it('opens on the current month when it has content', () => {
    const archive = buildArchive([OCT], [mkReflection('2026-09-06')], '2026-10-26');
    expect(defaultMonthKey(archive, '2026-10-26')).toBe('2026-10');
  });

  it('falls back to the most recent past month with content', () => {
    const archive = buildArchive([OCT, { ...OCT, key: '2027-01', year: 2027, month: 1 }], [], '2026-11-02');
    expect(defaultMonthKey(archive, '2026-11-02')).toBe('2026-10');
  });

  it('returns null when nothing has content', () => {
    expect(defaultMonthKey(buildArchive([], [], '2026-10-26'), '2026-10-26')).toBeNull();
  });
});

describe('teachingExcerpt', () => {
  it('returns the first sentence, skipping title abbreviations', () => {
    expect(
      teachingExcerpt([
        block('St. Francis of Assisi showed us the path of true discipleship. He embraced poverty.'),
      ]),
    ).toBe('St. Francis of Assisi showed us the path of true discipleship.');
  });

  it('returns the whole paragraph when it is one sentence', () => {
    expect(teachingExcerpt([block('Francis saw the whole world as one big family')])).toBe(
      'Francis saw the whole world as one big family',
    );
  });

  it('is empty for an empty teaching', () => {
    expect(teachingExcerpt([])).toBe('');
  });
});

describe('monthLabel', () => {
  it('formats a month key', () => {
    expect(monthLabel('2026-09')).toBe('September 2026');
  });
});
