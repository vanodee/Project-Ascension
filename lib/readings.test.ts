import { describe, it, expect } from 'vitest';
import { getLiturgicalDay, mapUniversalisPayload, universalisScriptUrl } from './readings';

// The browser evaluates the Universalis JSONP script, so these fixtures are the
// already-expanded object handed to `universalisCallback`.

describe('universalisScriptUrl', () => {
  it('builds the Nigerian-calendar JSONP URL from a Lagos ISO date', () => {
    expect(universalisScriptUrl('2026-10-29')).toBe(
      'https://universalis.com/africa.nigeria/20261029/jsonpmass.js',
    );
  });
});

describe('getLiturgicalDay', () => {
  it('derives season, colour and lectionary cycle from the date', () => {
    expect(getLiturgicalDay('2026-10-29')).toEqual({
      date: '2026-10-29',
      season: 'Ordinary Time',
      colourVar: '--liturgical-ordinary',
      lectionaryYear: 'Year A  Week II',
    });
  });

  it('rolls both lectionary cycles over on the first Sunday of Advent', () => {
    // Advent 2026 begins Sunday 29 November and opens liturgical year 2027.
    expect(getLiturgicalDay('2026-11-28').lectionaryYear).toBe('Year A  Week II');
    const day = getLiturgicalDay('2026-11-29');
    expect(day.season).toBe('Advent');
    expect(day.lectionaryYear).toBe('Year B  Week I');
  });
});

describe('mapUniversalisPayload', () => {
  const payload = {
    day: '<div>Saints Simon and Jude, Apostles</div><div>&#160;&#160;or Saint Example</div>',
    Mass_R1: {
      source: 'Ephesians 2:19-22',
      text: '<div>You are no longer aliens or foreign visitors.</div><div>You are part of a building.</div>',
    },
    Mass_Ps: {
      source: 'Psalm 18(19)',
      text:
        '<div><i>Their word goes forth through all the earth.</i></div>' +
        '<div style="margin-top: 0.8em">The heavens proclaim the glory of God,</div>' +
        '<div style="text-indent: -2em">and the firmament shows forth the work of his hands.</div>',
    },
    Mass_G: { source: 'Luke 6:12-16', text: '<div>Jesus went out into the hills to pray.</div>' },
    copyright: { text: 'Copyright &copy; Universalis Publishing' },
  };

  it('maps readings in liturgical order, skipping absent ones', () => {
    const { readings } = mapUniversalisPayload(payload);
    expect(readings.map((r) => r.label)).toEqual(['First Reading', 'Responsorial Psalm', 'Gospel']);
    expect(readings[0]?.text).toEqual([
      'You are no longer aliens or foreign visitors.',
      'You are part of a building.',
    ]);
  });

  it('structures the psalm into refrain, strophe and continuation lines', () => {
    const psalm = mapUniversalisPayload(payload).readings[1];
    expect(psalm?.excerpt).toBe('Their word goes forth through all the earth.');
    expect(psalm?.psalmLines?.map((l) => [l.isRefrain, l.isStropheStart, l.isContinuation])).toEqual([
      [true, false, false],
      [false, true, false],
      [false, false, true],
    ]);
  });

  it('splits celebrations and strips the "or" prefix from alternatives', () => {
    expect(mapUniversalisPayload(payload).celebrations).toEqual([
      'Saints Simon and Jude, Apostles',
      'Saint Example',
    ]);
  });

  it('returns no readings for an unexpected payload', () => {
    expect(mapUniversalisPayload({}).readings).toEqual([]);
  });
});
