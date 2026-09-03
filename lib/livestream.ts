import type { LivestreamStatus } from './types';

// Livestream status — keyless. No YouTube Data API / Google Cloud project.
//
//  1. Live check: scrape the channel's public `/live` page. When the channel is
//     broadcasting, that URL resolves to a watch page whose canonical link is
//     the live video; when it is not, canonical is the channel URL.
//  2. Fallback: the most recent published video from the channel's public RSS
//     feed (`videos.xml`) — an official, keyless, stable endpoint.
//  3. Graceful degradation: last-known-good (in-memory, survives warm
//     invocations) → hardcoded snapshot, so the page never errors.
//
// Bounded by the page's ISR window (revalidate = 60s), so YouTube is hit at
// most ~1,440 times/day.

const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;
const REVALIDATE_SECONDS = 60;

// Cold-start / total-failure fallback: the most recent recorded stream at the
// time this was wired up. Only shown if BOTH the live scrape and the RSS feed
// fail on a cold cache.
const FALLBACK: LivestreamStatus = {
  isLive: false,
  videoId: '1mrvjMZN7Tk',
  title: 'Praise Fiesta 3.0',
};

// Survives across warm invocations in the same process (mirrors lib/readings.ts).
let lastKnownGood: LivestreamStatus | null = null;

const BROWSER_HEADERS: Record<string, string> = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
  // Skips the EU consent interstitial YouTube serves to datacenter IPs.
  cookie: 'SOCS=CAI; CONSENT=YES+1',
};

// Decode XML/HTML entities (RSS titles are XML-escaped).
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .trim();
}

// Decode a JSON string body (the title inside ytInitialPlayerResponse arrives
// with \uXXXX and \" escapes).
function decodeJsonString(raw: string): string {
  try {
    return JSON.parse(`"${raw}"`) as string;
  } catch {
    return raw;
  }
}

// Scrape the channel's /live page. Returns the live video when the channel is
// broadcasting right now, or null otherwise (not live, scheduled-only, error).
//
// NOTE: the not-live / RSS paths are verified against the real channel. The
// live-detection markers below (`canonical` watch URL, `"isLive":true`,
// `"videoId":"…","title":"…"`, `originalViewCount`) were validated against a
// third-party 24/7 stream — confirm them against a real parish broadcast the
// first time the channel goes live.
async function fetchLiveNow(channelId: string): Promise<LivestreamStatus | null> {
  const res = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
    headers: BROWSER_HEADERS,
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`YouTube /live HTTP ${res.status}`);
  const html = await res.text();

  const videoId = /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})">/
    .exec(html)?.[1];
  if (!videoId) return null;

  // Confirm the channel is actually broadcasting — not a scheduled premiere or
  // an ended stream that /live happened to resolve to.
  const isBroadcasting = /"isLive":true/.test(html);
  const isUpcoming = /"isUpcoming":true/.test(html);
  if (!isBroadcasting || isUpcoming) return null;

  const rawTitle = new RegExp(
    `"videoId":"${videoId}","title":"((?:[^"\\\\]|\\\\.)*)"`,
  ).exec(html)?.[1];
  const title = rawTitle ? decodeJsonString(rawTitle) : 'Live now';

  // Concurrent viewers (best-effort; the page omits it if the streamer hides it).
  const rawViewers = /"originalViewCount":"(\d+)"/.exec(html)?.[1];
  const viewerCount = rawViewers ? Number(rawViewers) : undefined;

  return {
    isLive: true,
    videoId,
    title,
    ...(viewerCount !== undefined ? { viewerCount } : {}),
  };
}

// Most recent published video from the channel's public RSS feed (no API key).
async function fetchMostRecent(channelId: string): Promise<LivestreamStatus> {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    { next: { revalidate: REVALIDATE_SECONDS } },
  );
  if (!res.ok) throw new Error(`YouTube RSS HTTP ${res.status}`);
  const xml = await res.text();

  const entry = /<entry>([\s\S]*?)<\/entry>/.exec(xml)?.[1];
  if (!entry) throw new Error('YouTube RSS: no entries');

  const videoId = /<yt:videoId>([\w-]{11})<\/yt:videoId>/.exec(entry)?.[1];
  if (!videoId) throw new Error('YouTube RSS: entry missing video id');
  const rawTitle = /<title>([^<]*)<\/title>/.exec(entry)?.[1];

  return {
    isLive: false,
    videoId,
    title: rawTitle ? decodeEntities(rawTitle) : 'Most recent broadcast',
  };
}

export async function getLivestreamStatus(): Promise<LivestreamStatus> {
  if (!CHANNEL_ID) return lastKnownGood ?? FALLBACK;

  try {
    const live = await fetchLiveNow(CHANNEL_ID).catch((err: unknown) => {
      console.error('[livestream] live check failed, falling back to recent:', err);
      return null;
    });
    if (live) {
      lastKnownGood = live;
      return live;
    }

    const recent = await fetchMostRecent(CHANNEL_ID);
    lastKnownGood = recent;
    return recent;
  } catch (err) {
    console.error('[livestream] status error:', err);
    return lastKnownGood ?? FALLBACK;
  }
}
