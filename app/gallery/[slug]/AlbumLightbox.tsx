'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import type { GalleryMediaItem } from '@/lib/types';
import styles from './AlbumLightbox.module.scss';

interface AlbumLightboxProps {
  media: GalleryMediaItem[];
}

/** Album photo grid with a keyboard-navigable, touch-friendly lightbox. */
export default function AlbumLightbox({ media }: AlbumLightboxProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback((): void => setActiveIndex(null), []);

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
    if (activeIndex === null) return;
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, close, step]);

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

      {active ? (
        <div
          className={styles.album__lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={active.altText}
          onClick={close}
        >
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
            <div className={styles['album__lightbox-controls']}>
              <button
                type="button"
                onClick={() => step(-1)}
                className={styles['album__lightbox-button']}
                aria-label="Previous photo"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={close}
                className={styles['album__lightbox-button']}
                aria-label="Close lightbox"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className={styles['album__lightbox-button']}
                aria-label="Next photo"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
