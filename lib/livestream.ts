import type { LivestreamStatus } from './types';

// YouTube Data API v3 integration (server-side only — see CLAUDE.md).
// Mocked until the API key is provided: reports "not live" with the most
// recent recorded Mass, which is the graceful-fallback path the real
// integration also needs.
export async function getLivestreamStatus(): Promise<LivestreamStatus> {
  return {
    isLive: false,
    videoId: 'dQw4w9WgXcQ',
    title: 'Sunday Mass — Solemnity of the Most Holy Trinity',
  };
}
