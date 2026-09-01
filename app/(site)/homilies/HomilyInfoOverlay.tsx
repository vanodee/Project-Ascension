'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import type { Homily } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { paragraphComponents } from '@/lib/portableText';
import { useFocusTrap } from '@/lib/useFocusTrap';
import styles from './HomilyInfoOverlay.module.scss';

interface HomilyInfoOverlayProps {
  homily: Homily;
  onClose: () => void;
}

// Keep in sync with the transform/opacity transition duration in HomilyInfoOverlay.module.scss.
const TRANSITION_MS = 300;

/** Full homily details overlay, opened from the sticky player bar's info button. */
export default function HomilyInfoOverlay({
  homily,
  onClose,
}: HomilyInfoOverlayProps): React.JSX.Element {
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, true);

  const requestClose = (): void => {
    setVisible(false);
    window.setTimeout(onClose, TRANSITION_MS);
  };

  useEffect(() => {
    // Double rAF so the initial (hidden) styles paint before flipping to visible,
    // otherwise the browser can skip straight to the end state with no transition.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true));
    });

    // `overflow: hidden` drops the body's scrollbar, which otherwise widens
    // the viewport and shifts everything sideways. Compensate with matching
    // right padding so the content box stays the same width while locked.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener('keydown', handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={dialogRef}
      className={`${styles.overlay} ${visible ? styles['overlay--visible'] : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={homily.title}
      tabIndex={-1}
      onClick={requestClose}
    >
      <button
        type="button"
        className={styles.overlay__close}
        onClick={requestClose}
        aria-label="Close"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className={styles.overlay__panel} onClick={(event) => event.stopPropagation()}>
        <header className={styles.overlay__header}>
          <p className={styles.overlay__meta}>
            {formatDate(homily.publishedAt)} • {homily.liturgicalSeason}
          </p>
          <h2 className={styles.overlay__title}>{homily.title}</h2>
          <p className={styles.overlay__author}>
            <Link href="/clergy" className={styles['overlay__author-link']}>
              {homily.authorName}
            </Link>
          </p>
        </header>

        {homily.scriptureReferences.length > 0 ? (
          <p className={styles.overlay__reading}>
            Readings: {homily.scriptureReferences.join('; ')}
          </p>
        ) : null}

        <div className={styles.overlay__body}>
          <PortableText
            value={homily.body}
            components={paragraphComponents(styles.overlay__paragraph)}
          />
        </div>
      </div>
    </div>
  );
}
