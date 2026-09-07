import { describe, it, expect } from 'vitest';
import { decompressUniversalisPayload } from './readings';

// Universalis serves the JSONP body with some string values written as a string
// literal followed by a chain of `.split("x").join("y")` calls. These tests lock
// down the server-side expansion of that format.

describe('decompressUniversalisPayload', () => {
  it('leaves plain JSON untouched (values re-serialise to themselves)', () => {
    const input = '{"a" : "hello","n" : 12345,"b" : {"c" : "d"}}';
    expect(JSON.parse(decompressUniversalisPayload(input))).toEqual({
      a: 'hello',
      n: 12345,
      b: { c: 'd' },
    });
  });

  it('applies a single split/join replacement', () => {
    const input = '{"t" : "aXbXc".split("X").join(" ")}';
    expect(JSON.parse(decompressUniversalisPayload(input))).toEqual({ t: 'a b c' });
  });

  it('applies a chain left-to-right, including replacements that seed later keys', () => {
    // "D" -> "d ", then "B" -> " a", so "BnD" -> " a" + "nd " = " and "
    const input = '{"t" : "oneBnDtwoBnDthree".split("D").join("d ").split("B").join(" a")}';
    expect(JSON.parse(decompressUniversalisPayload(input))).toEqual({
      t: 'one and two and three',
    });
  });

  it('handles the real Universalis payload shape', () => {
    const raw =
      'universalisCallback({"number" : 20260907,"date" : "Monday 7 September 2026",' +
      '"Mass_R1" : {"source" : "1 Corinthians 5:1-8","text" : ' +
      '"Christ, our passover, has been sacrificed; let us celebrateqfeast.".split("q").join(" the ")},' +
      '"Mass_GA" : {"source" : "Ps118:105","text" : "<div>Alleluia!</div>"}});';
    const match = /^universalisCallback\(([\s\S]*?)\);?\s*$/.exec(raw.trim());
    const inner = match?.[1];
    expect(inner).toBeDefined();
    const parsed = JSON.parse(decompressUniversalisPayload(inner ?? ''));
    expect(parsed.Mass_R1.text).toBe(
      'Christ, our passover, has been sacrificed; let us celebrate the feast.',
    );
    // Uncompressed sibling value passes through intact.
    expect(parsed.Mass_GA.text).toBe('<div>Alleluia!</div>');
    expect(parsed.number).toBe(20260907);
  });

  it('does not treat a trailing dot that is not .split( as a chain', () => {
    const input = '{"t" : "end.","u" : "next"}';
    expect(JSON.parse(decompressUniversalisPayload(input))).toEqual({
      t: 'end.',
      u: 'next',
    });
  });
});
