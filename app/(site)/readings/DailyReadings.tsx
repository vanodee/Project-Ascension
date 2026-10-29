'use client';

import Image from 'next/image';
import { useDailyReadings } from '@/components/readings/useDailyReadings';
import { getLiturgicalDay } from '@/lib/readings';
import { formatDate } from '@/lib/format';
import styles from './page.module.scss';

const READING_ICONS: Record<string, string> = {
  'First Reading': '/icons/reading-bible.svg',
  'Responsorial Psalm': '/icons/reading-harp.svg',
  'Second Reading': '/icons/reading-bible.svg',
  'Gospel': '/icons/reading-cross.svg',
};

const skeleton = (width: 'short' | 'medium' | 'full'): string =>
  `${styles.readings__skeleton} ${styles[`readings__skeleton--${width}`]}`;

interface DailyReadingsProps {
  /** Lagos date the page was rendered for, "YYYY-MM-DD". */
  serverDate: string;
}

/** Date, liturgical banner and the full readings — loaded from Universalis in the browser. */
export default function DailyReadings({ serverDate }: DailyReadingsProps): React.JSX.Element {
  const state = useDailyReadings(serverDate);
  const day = getLiturgicalDay(state.date);

  if (state.status === 'error') {
    return (
      <>
        <p className={styles.readings__date}>{formatDate(day.date)}</p>
        <p className={styles.readings__unavailable}>
          Today’s readings could not be loaded just now. Please check back shortly, or
          read them at{' '}
          <a href="https://universalis.com/mass.htm" rel="noopener noreferrer">
            universalis.com
          </a>
          .
        </p>
      </>
    );
  }

  const daily = state.status === 'ready' ? state.data : null;

  return (
    <>
      <p className={styles.readings__date}>{formatDate(day.date)}</p>

      <div className={styles.readings__banner}>
        <div className={styles['readings__banner-day']}>
          {daily ? (
            daily.celebrations.map((cel) => (
              <p key={cel} className={styles['readings__banner-celebration']}>{cel}</p>
            ))
          ) : (
            <p className={styles['readings__banner-celebration']}>
              <span className={skeleton('medium')} />
            </p>
          )}
        </div>
        <div
          className={styles['readings__banner-season']}
          style={{ backgroundColor: `var(${day.colourVar})` }}
        >
          <Image src="/icons/season-badge.svg" alt="" width={24} height={32} />
          <div>
            <p className={styles['readings__banner-season-name']}>{day.season}</p>
            <p className={styles['readings__banner-season-year']}>{day.lectionaryYear}</p>
          </div>
        </div>
      </div>

      {daily ? (
        <>
          <div className={styles.readings__list}>
            {daily.readings.map((reading) => (
              <section key={reading.label} className={styles.readings__reading}>
                <header className={styles['readings__reading-header']}>
                  <span className={styles['readings__reading-icon']}>
                    <Image
                      src={READING_ICONS[reading.label] ?? '/icons/reading-bible.svg'}
                      alt=""
                      width={72}
                      height={72}
                    />
                  </span>
                  <div className={styles['readings__reading-titles']}>
                    <p className={styles['readings__reading-label']}>{reading.label}</p>
                    <h2 className={styles['readings__reading-reference']}>{reading.reference}</h2>
                  </div>
                </header>
                {reading.psalmLines ? (
                  <div className={styles.readings__psalm}>
                    {reading.psalmLines.map((line, i) => (
                      <p
                        key={i}
                        className={[
                          line.isRefrain
                            ? styles['readings__psalm-refrain']
                            : styles['readings__psalm-verse'],
                          line.isContinuation ? styles['readings__psalm-verse--continuation'] : '',
                          line.isStropheStart && !line.isRefrain
                            ? styles['readings__psalm-verse--strophe-start']
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {line.text}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className={styles['readings__reading-text']}>
                    {reading.text.map((paragraph) => (
                      <p key={paragraph.slice(0, 32)} className={styles.readings__paragraph}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
                {reading.label === 'First Reading' || reading.label === 'Second Reading' ? (
                  <p className={styles.readings__response}>The Word of the Lord.</p>
                ) : reading.label === 'Gospel' ? (
                  <p className={styles.readings__response}>The Gospel of the Lord.</p>
                ) : null}
              </section>
            ))}
          </div>

          <p className={styles.readings__attribution}>{daily.copyright}</p>
        </>
      ) : (
        <div className={styles.readings__list} aria-busy="true">
          <p className={styles['readings__sr-only']} role="status">
            Loading today’s readings…
          </p>
          {['First Reading', 'Responsorial Psalm', 'Gospel'].map((label) => (
            <div key={label} className={styles.readings__reading} aria-hidden="true">
              <div className={styles['readings__reading-titles']}>
                <span className={skeleton('short')} />
                <span className={`${skeleton('medium')} ${styles['readings__skeleton--heading']}`} />
              </div>
              <div className={styles['readings__reading-text']}>
                <span className={skeleton('full')} />
                <span className={skeleton('full')} />
                <span className={skeleton('full')} />
                <span className={skeleton('medium')} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
