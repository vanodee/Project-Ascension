'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Homily } from '@/lib/types';
import { formatDate, formatDuration } from '@/lib/format';
import HomilyPlayerBar from './HomilyPlayerBar';
import HomilyInfoOverlay from './HomilyInfoOverlay';
import HomilyNowPlaying from './HomilyNowPlaying';
import styles from './HomilyArchive.module.scss';

interface HomilyArchiveProps {
  homilies: Homily[];
}

const ALL = 'All';

function searchableText(homily: Homily): string {
  return [homily.title, homily.authorName, ...homily.scriptureReferences].join(' ').toLowerCase();
}

/**
 * Filterable homily archive — search by title/scripture/priest, plus filter
 * by priest, liturgical season, and published-date range.
 */
export default function HomilyArchive({ homilies }: HomilyArchiveProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [priestFilter, setPriestFilter] = useState<string>(ALL);
  const [seasonFilter, setSeasonFilter] = useState<string>(ALL);
  const [priestOpen, setPriestOpen] = useState(false);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [nowPlaying, setNowPlaying] = useState<Homily | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  // Whichever homily's info overlay is currently open — may be the one
  // playing (opened via the player bar's meta button) or, for a text-only
  // homily, the only view it ever gets (opened directly from its row).
  const [overlayHomily, setOverlayHomily] = useState<Homily | null>(null);

  const selectHomily = (homily: Homily): void => {
    if (!homily.audioUrl) {
      // Text-only homily: the overlay *is* the whole experience — no player,
      // no autoplay. Re-clicking its already-open row closes it, the same
      // toggle pattern the audio path uses below to stop playback.
      if (overlayHomily?.slug === homily.slug) {
        closeOverlay();
        return;
      }
      setOverlayHomily(homily);
      window.history.pushState(null, '', `/homilies?read=${homily.slug}`);
      return;
    }

    // Re-clicking the row that's already playing stops it — the redesigned
    // player bar has no dedicated close button, so this is one dismiss path
    // (the Now Playing strip's stop button is the other).
    if (nowPlaying?.slug === homily.slug) {
      stopPlaying();
      return;
    }
    setNowPlaying(homily);
    setAutoplay(true);
    setOverlayHomily(null);
    window.history.pushState(null, '', `/homilies?play=${homily.slug}`);
  };

  const stopPlaying = (): void => {
    setNowPlaying(null);
    // Only the overlay for the homily that just stopped needs clearing — a
    // text-only homily's overlay is unrelated to audio playback.
    setOverlayHomily((current) => (current?.slug === nowPlaying?.slug ? null : current));
    window.history.pushState(null, '', '/homilies');
  };

  const closeOverlay = (): void => {
    // The overlay only has its own URL param (`?read=`) when it was opened
    // directly for a text-only homily — for the playing homily's overlay,
    // `?play=` already covers the URL and closing it shouldn't touch that.
    const wasTextOnly = overlayHomily !== null && overlayHomily.slug !== nowPlaying?.slug;
    setOverlayHomily(null);
    if (wasTextOnly) {
      window.history.pushState(
        null,
        '',
        nowPlaying ? `/homilies?play=${nowPlaying.slug}` : '/homilies',
      );
    }
  };

  // Auto-select when landing on a direct link (e.g. /homilies?play=… or
  // ?read=…) — without autoplaying, since that isn't a direct user gesture.
  // Also resyncs on browser back/forward.
  useEffect(() => {
    const applyFromLocation = (): void => {
      const params = new URLSearchParams(window.location.search);
      const playSlug = params.get('play');
      const readSlug = params.get('read');
      const playMatch = playSlug ? homilies.find((h) => h.slug === playSlug) : undefined;
      const readMatch = readSlug ? homilies.find((h) => h.slug === readSlug) : undefined;
      setAutoplay(false);
      setNowPlaying(playMatch ?? null);
      setOverlayHomily(readMatch ?? null);
    };

    applyFromLocation();
    window.addEventListener('popstate', applyFromLocation);
    return () => window.removeEventListener('popstate', applyFromLocation);
  }, [homilies]);

  const priests = useMemo(
    () => [ALL, ...new Set(homilies.map((h) => h.authorName))],
    [homilies],
  );
  const seasons = useMemo(
    () => [ALL, ...new Set(homilies.map((h) => h.liturgicalSeason))],
    [homilies],
  );

  const filtered = homilies.filter((homily) => {
    const publishedDate = homily.publishedAt.slice(0, 10);
    return (
      searchableText(homily).includes(query.trim().toLowerCase()) &&
      (priestFilter === ALL || homily.authorName === priestFilter) &&
      (seasonFilter === ALL || homily.liturgicalSeason === seasonFilter) &&
      (!dateFrom || publishedDate >= dateFrom) &&
      (!dateTo || publishedDate <= dateTo)
    );
  });

  return (
    <div className={styles.archive}>
      <label className={styles.archive__search}>
        <svg
          className={styles['archive__search-icon']}
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="14" y1="14" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className={styles['archive__search-label']}>Search homilies</span>
        <input
          type="text"
          className={styles['archive__search-input']}
          placeholder="Search by title, priest, or scripture..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className={styles.archive__filters}>
        <label className={styles.archive__filter}>
          <span className={styles['archive__filter-label']}>Priest</span>
          <span className={styles['archive__select-wrap']}>
            <select
              value={priestFilter}
              onChange={(event) => setPriestFilter(event.target.value)}
              onFocus={() => setPriestOpen(true)}
              onBlur={() => setPriestOpen(false)}
              className={styles['archive__filter-select']}
            >
              {priests.map((priest) => (
                <option key={priest} value={priest}>
                  {priest}
                </option>
              ))}
            </select>
            <span
              className={`${styles['archive__select-chevron']} ${
                priestOpen ? styles['archive__select-chevron--open'] : ''
              }`}
              aria-hidden="true"
            />
          </span>
        </label>
        <label className={styles.archive__filter}>
          <span className={styles['archive__filter-label']}>Season</span>
          <span className={styles['archive__select-wrap']}>
            <select
              value={seasonFilter}
              onChange={(event) => setSeasonFilter(event.target.value)}
              onFocus={() => setSeasonOpen(true)}
              onBlur={() => setSeasonOpen(false)}
              className={styles['archive__filter-select']}
            >
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
            <span
              className={`${styles['archive__select-chevron']} ${
                seasonOpen ? styles['archive__select-chevron--open'] : ''
              }`}
              aria-hidden="true"
            />
          </span>
        </label>
        <label className={styles.archive__filter}>
          <span className={styles['archive__filter-label']}>From</span>
          <input
            type="date"
            className={styles['archive__filter-date']}
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(event) => setDateFrom(event.target.value)}
          />
        </label>
        <label className={styles.archive__filter}>
          <span className={styles['archive__filter-label']}>To</span>
          <input
            type="date"
            className={styles['archive__filter-date']}
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(event) => setDateTo(event.target.value)}
          />
        </label>
      </div>

      {nowPlaying ? <HomilyNowPlaying homily={nowPlaying} onStop={stopPlaying} /> : null}

      <div className={styles.archive__list}>
        {filtered.map((homily) => {
          const isPlaying = nowPlaying?.slug === homily.slug;
          const isReadingOnly = !homily.audioUrl && overlayHomily?.slug === homily.slug;
          const isActive = isPlaying || isReadingOnly;
          return (
            <button
              key={homily.slug}
              type="button"
              onClick={() => selectHomily(homily)}
              className={`${styles.archive__item} ${
                isActive ? styles['archive__item--active'] : ''
              }`}
              aria-pressed={isActive}
            >
              <span className={styles['archive__item-main']}>
                <span className={styles['archive__item-meta']}>
                  {formatDate(homily.publishedAt)} • {homily.liturgicalSeason}
                </span>
                <span className={styles['archive__item-title']}>{homily.title}</span>
                <span className={styles['archive__item-author']}>
                  {homily.authorName} — {homily.scriptureReferences.join('; ')}
                </span>
              </span>
              <span className={styles['archive__item-duration']}>
                {homily.audioUrl
                  ? isPlaying
                    ? '▶ Playing'
                    : `► ${formatDuration(homily.audioDurationSeconds)}`
                  : 'Text Only'}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 ? (
          <p className={styles.archive__empty}>
            No homilies match your search and filters.
          </p>
        ) : null}
      </div>

      <HomilyPlayerBar
        homily={nowPlaying}
        autoplay={autoplay}
        infoOpen={nowPlaying !== null && overlayHomily?.slug === nowPlaying.slug}
        onToggleInfo={() =>
          setOverlayHomily((current) => (current?.slug === nowPlaying?.slug ? null : nowPlaying))
        }
      />

      {overlayHomily ? <HomilyInfoOverlay homily={overlayHomily} onClose={closeOverlay} /> : null}
    </div>
  );
}
