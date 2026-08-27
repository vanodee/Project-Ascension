'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import type { GalleryMediaItem } from '@/lib/types';
import styles from './AlbumLightbox.module.scss';

interface AlbumLightboxProps {
  media: GalleryMediaItem[];
}

// Keep in sync with the transform/opacity transition duration in AlbumLightbox.module.scss.
const TRANSITION_MS = 300;

/** Album photo grid with a keyboard-navigable, touch-friendly lightbox. */
export default function AlbumLightbox({ media }: AlbumLightboxProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  const requestClose = useCallback((): void => {
    setVisible(false);
    window.setTimeout(() => setActiveIndex(null), TRANSITION_MS);
  }, []);

  const step = useCallback(
    (direction: 1 | -1): void => {
      setActiveIndex((current) => {
        if (current === null) return current;
        return (current + direction + media.length) % media.length;
      });
    },
    [media.length],
  );

  useEffect(() => {
    if (activeIndex === null) return undefined;

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
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener('keydown', handleKey);
    };
  }, [activeIndex, requestClose, step]);

  const active = activeIndex !== null ? media[activeIndex] : undefined;

  return (
    <>
      <div className={styles.album__grid}>
        {media.map((item, index) => (
          <button
            key={`${item.url}-${item.caption}`}
            type="button"
            className={styles.album__tile}
            onClick={() => setActiveIndex(index)}
            aria-label={`View ${item.altText}`}
          >
            <Image
              src={item.url}
              alt={item.altText}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 480px) 50vw, 100vw"
              className={styles.album__photo}
            />
          </button>
        ))}
      </div>

      {active && activeIndex !== null ? (
        <div
          className={`${styles.album__lightbox} ${visible ? styles['album__lightbox--visible'] : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={active.altText}
          onClick={requestClose}
        >
          <button
            type="button"
            className={styles['album__lightbox-close']}
            onClick={requestClose}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div
            className={styles['album__lightbox-inner']}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles['album__lightbox-image']}>
              <Image
                src={active.url}
                alt={active.altText}
                fill
                sizes="100vw"
                className={styles['album__lightbox-photo']}
              />
            </div>
            <p className={styles['album__lightbox-caption']}>{active.caption}</p>
            <div className={styles['album__lightbox-nav']}>
              <button
                type="button"
                onClick={() => step(-1)}
                className={styles['album__lightbox-arrow']}
                aria-label="Previous photo"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <polyline
                    points="15 6 9 12 15 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span className={styles['album__lightbox-counter']}>
                {activeIndex + 1} of {media.length}
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                className={styles['album__lightbox-arrow']}
                aria-label="Next photo"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <polyline
                    points="9 6 15 12 9 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
