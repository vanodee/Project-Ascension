'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import type { Announcement } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/format';
import { paragraphComponents } from '@/lib/portableText';
import styles from './AnnouncementModal.module.scss';

interface AnnouncementModalProps {
  announcement: Announcement;
  onClose: () => void;
}

// Keep in sync with the transform/opacity transition duration in AnnouncementModal.module.scss.
const TRANSITION_MS = 300;

/** Announcement detail overlay — shared by the announcements grid and the homepage. */
export default function AnnouncementModal({
  announcement,
  onClose,
}: AnnouncementModalProps): React.JSX.Element {
  const [visible, setVisible] = useState(false);

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
      className={`${styles.modal} ${visible ? styles['modal--visible'] : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={announcement.title}
      onClick={requestClose}
    >
      <button
        type="button"
        className={styles.modal__close}
        onClick={requestClose}
        aria-label="Close"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className={styles.modal__panel} onClick={(event) => event.stopPropagation()}>
        <div
          className={styles.modal__hero}
          style={{
            background: `linear-gradient(to bottom, ${announcement.society.color}, transparent)`,
          }}
        >
          <Image
            src="/images/Announcement Default Large.png"
            alt=""
            width={900}
            height={508}
            className={styles['modal__hero-icon']}
          />
          <div
            className={styles['modal__hero-logo']}
          >
            <Image
              src={announcement.society.logo}
              alt=""
              fill
              sizes="72px"
              className={styles['modal__hero-logo-img']}
            />
          </div>
        </div>

        <div className={styles.modal__content}>
          <header className={styles.modal__header}>
            <h2 className={styles.modal__title}>{announcement.title}</h2>
            {announcement.eventDate ? (
              <p className={styles['modal__meta-row']}>
                <Image src="/icons/calendar.svg" alt="" width={24} height={24} />
                <span>
                  {formatDate(announcement.eventDate)} • {formatTime(announcement.eventDate)}
                </span>
              </p>
            ) : null}
            {announcement.eventLocation ? (
              <p className={styles['modal__meta-row']}>
                <Image src="/icons/location.svg" alt="" width={24} height={24} />
                <span>{announcement.eventLocation}</span>
              </p>
            ) : null}
          </header>

          {announcement.image ? (
            <div className={styles.modal__image}>
              <Image
                src={announcement.image}
                alt=""
                width={802}
                height={451}
                sizes="(min-width: 900px) 802px, 100vw"
                className={styles['modal__image-img']}
              />
            </div>
          ) : null}

          <div className={styles.modal__body}>
            <PortableText
              value={announcement.body}
              components={paragraphComponents(styles.modal__paragraph)}
            />
          </div>
        </div>

        <div className={styles.modal__footer}>
          <Image
            src="/icons/ascension_logo_dark.svg"
            alt=""
            width={72}
            height={74}
            className={styles.modal__watermark}
          />
        </div>
      </div>
    </div>
  );
}
