// Date/time formatting helpers — Lagos timezone, en-NG style output.
const LAGOS_TZ = 'Africa/Lagos';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', {
    timeZone: LAGOS_TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString('en-NG', {
      timeZone: LAGOS_TZ,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase();
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} • ${formatTime(iso)}`;
}

/** Formats a duration in seconds as "M:SS" (or "H:MM:SS" past an hour), e.g. 1084 -> "18:04". */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const totalSeconds = Math.round(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const paddedSecs = secs.toString().padStart(2, '0');
  return hrs > 0 ? `${hrs}:${mins.toString().padStart(2, '0')}:${paddedSecs}` : `${mins}:${paddedSecs}`;
}

/** Short calendar-block parts, e.g. { weekday: "SAT", day: "18", month: "MAY" } */
export function dateBlockParts(iso: string): { weekday: string; day: string; month: string } {
  const date = new Date(iso);
  return {
    weekday: date
      .toLocaleDateString('en-NG', { timeZone: LAGOS_TZ, weekday: 'short' })
      .toUpperCase(),
    day: date.toLocaleDateString('en-NG', { timeZone: LAGOS_TZ, day: '2-digit' }),
    month: date
      .toLocaleDateString('en-NG', { timeZone: LAGOS_TZ, month: 'short' })
      .toUpperCase(),
  };
}
