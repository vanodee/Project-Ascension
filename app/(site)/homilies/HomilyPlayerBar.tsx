'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Homily } from '@/lib/types';
import { formatDate, formatDuration } from '@/lib/format';
import MarqueeText from '@/components/ui/MarqueeText';
import styles from './HomilyPlayerBar.module.scss';

interface HomilyPlayerBarProps {
  homily: Homily | null;
  autoplay: boolean;
  infoOpen: boolean;
  onToggleInfo: () => void;
}

const SKIP_SECONDS = 15;

// Keep in sync with the shell + content/stagger animation durations in
// HomilyPlayerBar.module.scss ($shell-duration + $content-phase-length).
const ANIMATION_MS = 680;

type Phase = 'hidden' | 'entering' | 'idle' | 'exiting';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Owns the sticky player's mount lifecycle and its slide/grow-in, fade/shrink-out
 * shell animation. Stays mounted (playing the entrance or exit animation) for a
 * beat after `homily` flips to/from null, and only unmounts once the exit
 * animation finishes. Switching between two non-null homilies (changing track
 * while already visible) does NOT replay the shell animation — only the very
 * first appearance and the final close do — so `PlayerControls` underneath is
 * swapped in place via its `key`.
 */
export default function HomilyPlayerBar({
  homily,
  autoplay,
  infoOpen,
  onToggleInfo,
}: HomilyPlayerBarProps): React.JSX.Element | null {
  const [phase, setPhase] = useState<Phase>('hidden');
  const [renderedHomily, setRenderedHomily] = useState<Homily | null>(null);
  const phaseRef = useRef<Phase>('hidden');
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    window.clearTimeout(timeoutRef.current);

    if (homily) {
      setRenderedHomily(homily);
      // Only play the entrance animation the first time the bar appears (or if
      // it's re-selected while still mid-exit) — a plain track switch while
      // already visible just swaps the content underneath.
      if (phaseRef.current === 'hidden' || phaseRef.current === 'exiting') {
        setPhase('entering');
        timeoutRef.current = window.setTimeout(() => setPhase('idle'), ANIMATION_MS);
      }
    } else if (renderedHomily) {
      setPhase('exiting');
      timeoutRef.current = window.setTimeout(() => {
        setPhase('hidden');
        setRenderedHomily(null);
      }, ANIMATION_MS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homily?.slug ?? null]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  if (phase === 'hidden' || !renderedHomily) return null;

  const phaseClass =
    phase === 'entering'
      ? styles['player--entering']
      : phase === 'exiting'
        ? styles['player--exiting']
        : '';

  return (
    <div className={`${styles.player} ${phaseClass}`} role="region" aria-label="Now playing">
      <PlayerControls
        key={renderedHomily.slug}
        homily={renderedHomily}
        autoplay={autoplay}
        infoOpen={infoOpen}
        onToggleInfo={onToggleInfo}
      />
    </div>
  );
}

interface PlayerControlsProps {
  homily: Homily;
  autoplay: boolean;
  infoOpen: boolean;
  onToggleInfo: () => void;
}

/**
 * The actual audio element + controls for one track. Remounted (via the
 * `key` the parent puts on it) on every track switch, so `autoplay` only
 * needs to be read once, on mount, and playback/seek state can't leak
 * between tracks.
 */
function PlayerControls({
  homily,
  autoplay,
  infoOpen,
  onToggleInfo,
}: PlayerControlsProps): React.JSX.Element {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    // Swallow AbortError: expected when the bar unmounts (track switch/close)
    // while a play() request from this effect is still in flight.
    if (autoplay) audioRef.current?.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = (): void => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const handleSeek = (value: number): void => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = (value / 100) * audio.duration;
  };

  const skipBy = (seconds: number): void => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = clamp(audio.currentTime + seconds, 0, audio.duration);
  };

  const progress = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src={homily.audioUrl || undefined}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setTotalTime(event.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
      />

      <button
        type="button"
        className={styles.player__meta}
        onClick={onToggleInfo}
        aria-expanded={infoOpen}
        aria-label={`${infoOpen ? 'Hide' : 'Show'} details for ${homily.title}`}
      >
        <Image
          src="/icons/Homily_icon.svg"
          alt=""
          width={31}
          height={31}
          className={styles.player__icon}
        />
        <span className={styles.player__text}>
          <MarqueeText text={homily.title} className={styles.player__title} />
          <MarqueeText
            text={`${homily.authorName} • ${formatDate(homily.publishedAt)}`}
            className={styles.player__author}
          />
        </span>
      </button>

      <div className={styles.player__controls}>
        <button
          type="button"
          className={styles['player__skip-btn']}
          onClick={() => skipBy(-SKIP_SECONDS)}
          aria-label={`Rewind ${SKIP_SECONDS} seconds`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              fill="currentColor"
              d="M5.64686 7.484C5.71578 7.44514 5.79412 7.42611 5.8732 7.42904C5.95227 7.43196 6.02899 7.45672 6.09486 7.50057C6.09943 7.50324 6.104 7.50648 6.10857 7.51029C6.16474 7.55095 6.21021 7.60465 6.24106 7.66675C6.27192 7.72886 6.28724 7.79753 6.28571 7.86686V13.8571C6.28571 13.9708 6.24056 14.0798 6.16019 14.1602C6.07982 14.2406 5.97081 14.2857 5.85714 14.2857C5.74348 14.2857 5.63447 14.2406 5.5541 14.1602C5.47372 14.0798 5.42857 13.9708 5.42857 13.8571V9.08857C5.1117 9.4167 4.7539 9.70267 4.364 9.93943C4.2664 9.998 4.14953 10.0154 4.0391 9.98781C3.92866 9.96022 3.83372 9.88989 3.77514 9.79229C3.71657 9.69469 3.69916 9.57782 3.72676 9.46738C3.75435 9.35695 3.82469 9.262 3.92229 9.20343C4.79657 8.67943 5.29486 7.92914 5.464 7.67486C5.47848 7.652 5.49067 7.63352 5.50057 7.61943C5.53878 7.56407 5.58873 7.51783 5.64686 7.484ZM12.1869 7.43086C12.2923 7.44179 12.39 7.49142 12.4609 7.57015C12.5319 7.64888 12.5712 7.75113 12.5712 7.85714C12.5712 7.96315 12.5319 8.0654 12.4609 8.14414C12.39 8.22287 12.2923 8.27249 12.1869 8.28343L12.1429 8.28571H9.94857L9.77143 9.68629H9.77886C10.1495 9.67301 10.5206 9.68983 10.8886 9.73657L11.0046 9.756C11.5788 9.86814 12.0883 10.1962 12.4279 10.6727C12.7675 11.1492 12.9114 11.7378 12.83 12.3172C12.7486 12.8967 12.4482 13.4228 11.9904 13.7873C11.5327 14.1519 10.9527 14.327 10.3697 14.2766L10.252 14.2634C9.94289 14.2199 9.64597 14.1136 9.37954 13.9509C9.1131 13.7883 8.88281 13.5728 8.70286 13.3177L8.63486 13.216L8.61314 13.1777C8.56573 13.0825 8.5554 12.9731 8.58416 12.8707C8.61293 12.7683 8.67874 12.6803 8.76879 12.6237C8.85885 12.5672 8.96672 12.5461 9.07144 12.5646C9.17616 12.5832 9.27026 12.64 9.33543 12.724L9.36057 12.76L9.44857 12.8846C9.6764 13.1736 10.007 13.3636 10.3714 13.4149L10.5171 13.428C10.8708 13.4417 11.217 13.3236 11.4886 13.0967C11.7601 12.8697 11.9378 12.55 11.9871 12.1995C12.0364 11.849 11.9539 11.4927 11.7554 11.1996C11.557 10.9065 11.2569 10.6975 10.9131 10.6131L10.7697 10.5851C10.4497 10.5406 10.0897 10.5354 9.80171 10.5429C9.65296 10.547 9.50434 10.555 9.356 10.5669L9.32514 10.5697H9.324C9.26004 10.5759 9.19551 10.5676 9.13519 10.5454C9.07488 10.5233 9.02031 10.4878 8.97554 10.4417C8.93077 10.3956 8.89693 10.3401 8.87654 10.2791C8.85614 10.2182 8.84971 10.1535 8.85771 10.0897L9.14457 7.804L9.16171 7.72629C9.18943 7.63985 9.24387 7.56445 9.3172 7.51094C9.39052 7.45744 9.47894 7.42859 9.56971 7.42857H12.1429L12.1869 7.43086ZM1.57143 1.42857C1.68509 1.42857 1.7941 1.47372 1.87447 1.5541C1.95485 1.63447 2 1.74348 2 1.85714V4.53543C3.15657 2.89886 5.32343 1.71429 7.85714 1.71429C10.5903 1.71429 12.7491 3.03257 14.2189 5.34171C14.2772 5.4376 14.2956 5.55255 14.2701 5.66185C14.2446 5.77116 14.1772 5.8661 14.0825 5.92627C13.9877 5.98644 13.8732 6.00704 13.7634 5.98364C13.6536 5.96025 13.5574 5.89472 13.4954 5.80114C12.1663 3.71314 10.2669 2.57143 7.85714 2.57143C5.51771 2.57143 3.58286 3.69657 2.62286 5.14286H5.28571C5.39938 5.14286 5.50839 5.18801 5.58876 5.26838C5.66913 5.34876 5.71429 5.45776 5.71429 5.57143C5.71429 5.68509 5.66913 5.7941 5.58876 5.87447C5.50839 5.95485 5.39938 6 5.28571 6H1.57143C1.45776 6 1.34876 5.95485 1.26838 5.87447C1.18801 5.7941 1.14286 5.68509 1.14286 5.57143V1.85714C1.14286 1.74348 1.18801 1.63447 1.26838 1.5541C1.34876 1.47372 1.45776 1.42857 1.57143 1.42857Z"
            />
          </svg>
        </button>

        <button
          type="button"
          className={styles['player__play-btn']}
          onClick={togglePlay}
          aria-label={isPlaying ? `Pause ${homily.title}` : `Play ${homily.title}`}
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
              <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                fill="currentColor"
                d="M4.5 4.2045C4.50027 3.94133 4.56978 3.68285 4.70154 3.45504C4.8333 3.22722 5.02268 3.03809 5.25067 2.90662C5.47865 2.77514 5.73721 2.70597 6.00038 2.70604C6.26356 2.70611 6.52208 2.77541 6.75 2.907L20.25 10.6995C20.4784 10.8311 20.668 11.0205 20.7999 11.2486C20.9318 11.4768 21.0012 11.7357 21.0012 11.9992C21.0012 12.2628 20.9318 12.5217 20.7999 12.7499C20.668 12.978 20.4784 13.1674 20.25 13.299L6.75 21.093C6.52197 21.2247 6.26331 21.294 6.00001 21.294C5.73671 21.294 5.47804 21.2247 5.25002 21.093C5.02199 20.9614 4.83263 20.772 4.70098 20.544C4.56932 20.316 4.50001 20.0573 4.5 19.794V4.2045Z"
              />
            </svg>
          )}
        </button>

        <button
          type="button"
          className={styles['player__skip-btn']}
          onClick={() => skipBy(SKIP_SECONDS)}
          aria-label={`Forward ${SKIP_SECONDS} seconds`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              fill="currentColor"
              d="M5.54333 7.38933C5.61113 7.35057 5.68845 7.33165 5.76649 7.33471C5.84452 7.33778 5.92012 7.36271 5.98467 7.40667L5.98933 7.41C6.04541 7.44932 6.09092 7.50186 6.12186 7.56297C6.15279 7.62407 6.16818 7.69186 6.16667 7.76033V13.5847C6.16667 13.6952 6.12277 13.8012 6.04463 13.8793C5.96649 13.9574 5.86051 14.0013 5.75 14.0013C5.63949 14.0013 5.53351 13.9574 5.45537 13.8793C5.37723 13.8012 5.33333 13.6952 5.33333 13.5847V8.97433C5.081 9.231 4.75067 9.50333 4.29767 9.775C4.20308 9.82865 4.09128 9.8432 3.98611 9.81554C3.88095 9.78789 3.79077 9.72021 3.73482 9.62698C3.67886 9.53374 3.66158 9.42232 3.68665 9.31651C3.71172 9.2107 3.77716 9.11889 3.869 9.06067C4.70067 8.56167 5.01533 8.09433 5.289 7.68733C5.32767 7.63 5.36589 7.57411 5.40367 7.51967C5.4395 7.46599 5.48731 7.42138 5.54333 7.38933ZM11.625 7.33567C11.7273 7.34654 11.822 7.39488 11.8908 7.47138C11.9596 7.54787 11.9976 7.64712 11.9976 7.75C11.9976 7.85288 11.9596 7.95213 11.8908 8.02863C11.822 8.10512 11.7273 8.15346 11.625 8.16433L11.5823 8.16667H9.77433L9.57233 9.489C9.81833 9.48233 10.1267 9.484 10.3957 9.52167L10.51 9.541C11.0755 9.65119 11.5772 9.97414 11.9117 10.4433C12.2462 10.9124 12.388 11.492 12.3078 12.0626C12.2276 12.6331 11.9316 13.1512 11.4808 13.51C11.03 13.8688 10.4587 14.0409 9.88467 13.991L9.76967 13.9783C9.43367 13.9313 9.11268 13.8089 8.83078 13.6201C8.54888 13.4313 8.3134 13.1811 8.142 12.8883L8.078 12.7717L8.06033 12.733C8.02375 12.6369 8.02396 12.5307 8.06092 12.4347C8.09789 12.3388 8.16901 12.2599 8.26061 12.2131C8.35222 12.1664 8.45785 12.1552 8.55723 12.1816C8.6566 12.2081 8.7427 12.2703 8.799 12.3563L8.82033 12.393L8.86033 12.4663C8.96819 12.6509 9.1165 12.8085 9.2941 12.9275C9.4717 13.0464 9.67396 13.1235 9.88567 13.153L9.958 13.161C10.3196 13.1928 10.6796 13.0846 10.9638 12.8586C11.2479 12.6327 11.4344 12.3063 11.485 11.9469C11.5355 11.5874 11.446 11.2223 11.2352 10.9268C11.0243 10.6313 10.708 10.4281 10.3517 10.359L10.28 10.347C10.058 10.316 9.77367 10.3147 9.53167 10.3237C9.40484 10.3284 9.27814 10.3361 9.15167 10.3467L9.12967 10.3487H9.12467L9.12367 10.3493L9.07567 10.3513C9.01624 10.3502 8.95773 10.3365 8.90406 10.3109C8.85038 10.2854 8.80278 10.2487 8.76444 10.2033C8.72609 10.1579 8.69789 10.1048 8.68172 10.0476C8.66555 9.99042 8.66178 9.93044 8.67067 9.87167L9.00467 7.68733L9.01233 7.64933C9.0348 7.55909 9.08681 7.47897 9.16008 7.4217C9.23335 7.36444 9.32367 7.33333 9.41667 7.33333H11.5823L11.625 7.33567ZM14.25 1.53333C14.48 1.53333 14.6667 1.72 14.6667 1.95V5.73467C14.6667 5.96467 14.48 6.15133 14.25 6.15133H10.465C10.3545 6.15133 10.2485 6.10743 10.1704 6.02929C10.0922 5.95115 10.0483 5.84517 10.0483 5.73467C10.0483 5.62416 10.0922 5.51818 10.1704 5.44004C10.2485 5.3619 10.3545 5.318 10.465 5.318H13.6463C12.7878 4.04097 11.5146 3.09968 10.0419 2.65336C8.56928 2.20705 6.98768 2.2831 5.56467 2.86867C4.069 3.48433 2.84433 4.648 2.12333 6.103C2.09927 6.15241 2.06567 6.19658 2.02447 6.23295C1.98327 6.26932 1.93528 6.29719 1.88326 6.31493C1.83124 6.33268 1.77623 6.33996 1.72139 6.33636C1.66655 6.33275 1.61296 6.31833 1.56371 6.29393C1.51447 6.26953 1.47054 6.23562 1.43445 6.19417C1.39836 6.15271 1.37083 6.10453 1.35345 6.05239C1.33606 6.00026 1.32916 5.94519 1.33315 5.89038C1.33713 5.83556 1.35192 5.78208 1.37667 5.733C2.185 4.10233 3.55933 2.793 5.24767 2.09833C6.71572 1.49421 8.33746 1.37083 9.88001 1.74591C11.4226 2.121 12.8066 2.97525 13.8333 4.186V1.95C13.8333 1.72 14.02 1.53333 14.25 1.53333Z"
            />
          </svg>
        </button>
      </div>

      <div className={styles.player__progress}>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={(event) => handleSeek(Number(event.target.value))}
          className={styles.player__seek}
          aria-label="Seek within recording"
          style={{ '--progress': `${progress}%` } as React.CSSProperties}
        />
        <div className={styles['player__time-row']}>
          <span className={styles.player__time}>{formatDuration(currentTime)}</span>
          <span className={styles.player__time}>
            {formatDuration(totalTime > 0 ? totalTime : homily.audioDurationSeconds)}
          </span>
        </div>
      </div>
    </>
  );
}
