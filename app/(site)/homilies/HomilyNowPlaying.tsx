import type { Homily } from '@/lib/types';
import { formatDate } from '@/lib/format';
import styles from './HomilyNowPlaying.module.scss';

interface HomilyNowPlayingProps {
  homily: Homily;
  onStop: () => void;
}

/**
 * Fixed "what's playing" strip, shown between the filters and the list
 * whenever a homily is loaded into the player bar. Deliberately its own
 * block (not a list-row variant) so it stays visible — and gives a way to
 * end playback — even when the active homily's row is filtered out of the
 * list below.
 */
export default function HomilyNowPlaying({
  homily,
  onStop,
}: HomilyNowPlayingProps): React.JSX.Element {
  return (
    <div className={styles['now-playing']} role="status">
      <span className={styles['now-playing__text']}>
        <span className={styles['now-playing__eyebrow']}>Now Playing</span>
        <span className={styles['now-playing__title']}>{homily.title}</span>
        <span className={styles['now-playing__author']}>
          {homily.authorName} • {formatDate(homily.publishedAt)}
        </span>
      </span>
      <button
        type="button"
        className={styles['now-playing__stop']}
        onClick={onStop}
        aria-label={`Stop playing ${homily.title}`}
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
