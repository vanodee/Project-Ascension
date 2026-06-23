import type { DailyReadings, PsalmLine, Reading } from './types';
import {
  getLiturgicalSeason,
  getSundayCycle,
  getWeekdayCycle,
  getLiturgicalColourVar,
} from './liturgical';

// In-memory fallback: survives across warm invocations within the same process.
let lastSuccessfulData: DailyReadings | null = null;

// Returns a Date whose UTC date fields reflect the current time in Lagos (UTC+1, no DST).
function getLagosDate(): Date {
  return new Date(Date.now() + 60 * 60 * 1000);
}

function toDateParam(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Decode common HTML entities and strip all tags, returning plain text.
// Named entities use \uXXXX escapes to avoid encoding issues in the source file.
function plainText(html: string): string {
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&rsquo;/g, '’') // right single quotation mark '
    .replace(/&lsquo;/g, '‘') // left single quotation mark '
    .replace(/&rdquo;/g, '”') // right double quotation mark "
    .replace(/&ldquo;/g, '“') // left double quotation mark "
    .replace(/&mdash;/g, '—') // em dash —
    .replace(/&ndash;/g, '–') // en dash –
    // Hex numeric entities, e.g. &#x2010; (non-breaking hyphen), &#x20; (space)
    .replace(/&#x([0-9a-fA-F]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    // Decimal numeric entities, e.g. &#8217;
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/<[^>]+>/g, '')
    .trim();
}

// Split Universalis HTML text into plain-text paragraphs.
// Universalis uses <div> blocks (not <p>), so split on </div>.
function toParagraphs(html: string): string[] {
  return html
    .split(/<\/(?:p|div)>/i)
    .map(plainText)
    .filter((s) => s.length > 0);
}

// Parse a Universalis psalm into structured lines.
// Each <div> is one line. Signals from the HTML:
//   <i> wrapper          → refrain (antiphon)
//   text-indent: -2em    → indented continuation (second half of a couplet)
//   margin-top: 0.8em    → new strophe begins here
function parsePsalmLines(html: string): PsalmLine[] {
  return html
    .split(/<\/div>/i)
    .map((chunk): PsalmLine | null => {
      const text = plainText(chunk).replace(/^ +/, '').trim();
      if (!text) return null;
      return {
        text,
        isRefrain: /<i>/i.test(chunk),
        isContinuation: /text-indent:\s*-2em/.test(chunk),
        isStropheStart: /margin-top:\s*0\.8em/.test(chunk),
      };
    })
    .filter((l): l is PsalmLine => l !== null);
}

interface UniversalisReading {
  source?: string;
  heading?: string;
  text?: string;
}

interface UniversalisPayload {
  date?: string;
  day?: string;
  Mass_R1?: UniversalisReading;
  Mass_Ps?: UniversalisReading;
  Mass_R2?: UniversalisReading;
  Mass_GA?: UniversalisReading;
  Mass_G?: UniversalisReading;
  copyright?: { text?: string };
}

function excerptFrom(text: string, limit = 120): string {
  if (text.length <= limit) return text;
  const cut = text.lastIndexOf(' ', limit);
  return text.slice(0, cut > 0 ? cut : limit) + '…';
}

function buildReading(
  label: string,
  raw: UniversalisReading | undefined,
  isPsalm = false,
): Reading | null {
  if (!raw?.source || !raw.text) return null;
  if (isPsalm) {
    const psalmLines = parsePsalmLines(raw.text);
    if (psalmLines.length === 0) return null;
    const refrain = psalmLines.find((l) => l.isRefrain)?.text ?? '';
    return {
      label,
      reference: plainText(raw.source),
      excerpt: refrain,
      text: psalmLines.map((l) => l.text),
      psalmLines,
    };
  }
  const paragraphs = toParagraphs(raw.text);
  if (paragraphs.length === 0) return null;
  return {
    label,
    reference: plainText(raw.source),
    excerpt: excerptFrom(paragraphs[0] ?? ''),
    text: paragraphs,
  };
}

async function fetchPayload(dateParam: string): Promise<UniversalisPayload> {
  const url = `https://universalis.com/africa.nigeria/${dateParam}/jsonpmass.js`;
  const res = await fetch(url, {
    next: { revalidate: secondsUntilMidnight() },
  });
  if (!res.ok) throw new Error(`Universalis HTTP ${res.status}`);

  const raw = await res.text();
  // Strip JSONP wrapper: universalisCallback({...});
  const match = /^universalisCallback\(([\s\S]*)\);?\s*$/.exec(raw);
  if (!match?.[1]) throw new Error('Unexpected Universalis response shape');

  return JSON.parse(match[1]) as UniversalisPayload;
}

function mapToDailyReadings(
  payload: UniversalisPayload,
  lagosDate: Date,
): DailyReadings {
  const season = getLiturgicalSeason(lagosDate);
  const cycle = getSundayCycle(lagosDate);
  const weekday = getWeekdayCycle(lagosDate);
  const colourVar = getLiturgicalColourVar(season);

  const readings: Reading[] = [
    buildReading('First Reading', payload.Mass_R1),
    buildReading('Responsorial Psalm', payload.Mass_Ps, true),
    buildReading('Second Reading', payload.Mass_R2),
    buildReading('Gospel', payload.Mass_G),
  ].filter((r): r is Reading => r !== null);

  // Universalis wraps each celebration in its own <div> and prefixes alternatives
  // with non-breaking spaces + "or". Split at </div> boundaries before stripping
  // HTML so the structure survives, then remove leading "or" from alternatives.
  const celebrations = (payload.day ?? '')
    .split(/<\/div>/i)
    .map(plainText)
    .map((s) => s.replace(/^\s*or\s+/i, '').trim())
    .filter((s) => s.length > 0);

  return {
    date: toIsoDate(lagosDate),
    celebrations,
    lectionaryYear: `Year ${cycle}  Week ${weekday}`,
    season,
    colourVar,
    copyright: plainText(payload.copyright?.text ?? 'Universalis Publishing'),
    readings,
  };
}

export async function getDailyReadings(): Promise<DailyReadings> {
  const lagosDate = getLagosDate();
  const dateParam = toDateParam(lagosDate);

  try {
    const payload = await fetchPayload(dateParam);
    const result = mapToDailyReadings(payload, lagosDate);
    lastSuccessfulData = result;
    return result;
  } catch (err) {
    console.error('[universalis] fetch error:', err);
    if (lastSuccessfulData !== null) return lastSuccessfulData;
    throw err;
  }
}

// Seconds from now until Lagos midnight (UTC+1, no DST). Used for fetch-level ISR.
export function secondsUntilMidnight(): number {
  const lagosNow = getLagosDate();
  const lagosMidnight = new Date(
    Date.UTC(
      lagosNow.getUTCFullYear(),
      lagosNow.getUTCMonth(),
      lagosNow.getUTCDate() + 1,
    ),
  );
  return Math.max(60, Math.floor((lagosMidnight.getTime() - Date.now()) / 1000));
}
