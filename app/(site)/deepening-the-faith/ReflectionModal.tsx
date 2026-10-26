'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import { dateBlockParts } from '@/lib/format';
import { monthLabel } from '@/lib/faithArchive';
import { useFocusTrap } from '@/lib/useFocusTrap';
import type { FaithReflection } from '@/lib/types';
import styles from './ReflectionModal.module.scss';

interface ReflectionModalProps {
  reflection: FaithReflection;
  theme: string | null;
  onClose: () => void;
}

// Keep in sync with the transform/opacity transition duration in ReflectionModal.module.scss.
const TRANSITION_MS = 300;

const teachingComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className={styles.modal__paragraph}>{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong className={styles.modal__strong}>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
  },
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Deepening the Faith reading view — the full weekly reflection in a modal. */
export default function ReflectionModal({
  reflection,
  theme,
  onClose,
}: ReflectionModalProps): React.JSX.Element {
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

  const date = dateBlockParts(`${reflection.date}T12:00:00+01:00`);
  const weekday = new Date(`${reflection.date}T12:00:00+01:00`).toLocaleDateString('en-NG', {
    timeZone: 'Africa/Lagos',
    weekday: 'long',
  });
  const titleId = `reflection-${reflection.slug}-title`;

  const chapters: { label: string; content: React.ReactNode }[] = [];

  if (reflection.biblicalReferences.length > 0) {
    chapters.push({
      label: 'Read',
      content: (
        <div className={styles.modal__references}>
          <Image src="/icons/reading-bible.svg" alt="" width={100} height={100} />
          <div className={styles['modal__references-info']}>
            <p className={styles['modal__references-label']}>Biblical references</p>
            <ul className={styles['modal__references-list']}>
              {reflection.biblicalReferences.map((ref) => (
                <li key={ref}>{ref}</li>
              ))}
            </ul>
          </div>
        </div>
      ),
    });
  }

  if (reflection.questions.length > 0) {
    chapters.push({
      label: 'Ponder',
      content: (
        <>
          <h3 className={styles['modal__chapter-title']}>Questions to ponder</h3>
          <ol className={styles.modal__questions}>
            {reflection.questions.map((question, i) => (
              <li key={i} className={styles.modal__question}>
                <span className={styles['modal__question-number']} aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <p className={styles['modal__question-text']}>{question}</p>
              </li>
            ))}
          </ol>
        </>
      ),
    });
  }

  if (reflection.teaching.length > 0) {
    chapters.push({
      label: 'Deepen',
      content: (
        <>
          <h3 className={styles['modal__chapter-title']}>Teaching</h3>
          <div className={styles.modal__teaching}>
            <PortableText value={reflection.teaching} components={teachingComponents} />
          </div>
        </>
      ),
    });
  }

  if (reflection.suggestedTask) {
    chapters.push({
      label: 'Live',
      content: (
        <div className={styles.modal__task}>
          <h3 className={styles['modal__chapter-title']}>Suggested task</h3>
          <p className={styles['modal__task-text']}>{reflection.suggestedTask}</p>
        </div>
      ),
    });
  }

  return (
    <div
      ref={dialogRef}
      className={`${styles.modal} ${visible ? styles['modal--visible'] : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onClick={requestClose}
    >
      <div className={styles.modal__panel} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modal__toolbar}>
          <p className={styles['modal__toolbar-label']}>Deepening the Faith</p>
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
        </div>

        <div className={styles.modal__theme}>
          <p className={styles['modal__theme-label']}>
            Theme for the month · {monthLabel(reflection.monthKey)}
          </p>
          <p className={styles['modal__theme-title']}>{theme ?? 'Monthly theme to be added'}</p>
        </div>

        <div className={styles.modal__entry}>
          <header className={styles.modal__header}>
            <div className={styles.modal__date}>
              <p className={styles['modal__date-day']}>{Number(date.day)}</p>
              <p className={styles['modal__date-weekday']}>{weekday}</p>
              <p className={styles['modal__date-month']}>
                {date.month} {reflection.date.slice(0, 4)}
              </p>
            </div>
            <div className={styles.modal__topic}>
              <p className={styles['modal__topic-label']}>Topic for the week</p>
              <h2 id={titleId} className={styles['modal__topic-title']}>
                {reflection.topic}
              </h2>
            </div>
          </header>

          {chapters.map((chapter, i) => (
            <section key={chapter.label} className={styles.modal__chapter}>
              <div className={styles['modal__chapter-margin']}>
                <p className={styles['modal__chapter-number']}>{pad(i + 1)}</p>
                <p className={styles['modal__chapter-label']}>{chapter.label}</p>
              </div>
              <div className={styles['modal__chapter-content']}>{chapter.content}</div>
            </section>
          ))}
        </div>

        <footer className={styles.modal__footer}>
          <p className={styles['modal__footer-text']}>For God and For His Glory!</p>
        </footer>
      </div>
    </div>
  );
}
