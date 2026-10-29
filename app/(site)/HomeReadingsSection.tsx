'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import { useDailyReadings } from '@/components/readings/useDailyReadings';
import { getLiturgicalDay } from '@/lib/readings';
import styles from './page.module.scss';

const READING_ICONS: Record<string, string> = {
  'First Reading': '/icons/reading-bible.svg',
  'Responsorial Psalm': '/icons/reading-harp.svg',
  'Second Reading': '/icons/reading-bible.svg',
};

const skeleton = (width: 'short' | 'medium' | 'full'): string =>
  `${styles.readings__skeleton} ${styles[`readings__skeleton--${width}`]}`;

interface HomeReadingsSectionProps {
  /** Lagos date the page was rendered for, "YYYY-MM-DD". */
  serverDate: string;
}

/** Homepage "Today's Readings" panel — readings load from Universalis in the browser. */
export default function HomeReadingsSection({
  serverDate,
}: HomeReadingsSectionProps): React.JSX.Element {
  const state = useDailyReadings(serverDate);
  const day = getLiturgicalDay(state.date);

  if (state.status === 'error') {
    return (
      <div className={styles.readings}>
        <SectionTitle eyebrow="Liturgy of the Word" title="Today’s Readings" />
        <p className={styles.readings__unavailable}>
          Today’s readings could not be loaded just now. Please check back shortly, or
          read them at{' '}
          <a href="https://universalis.com/mass.htm" rel="noopener noreferrer">
            universalis.com
          </a>
          .
        </p>
      </div>
    );
  }

  const daily = state.status === 'ready' ? state.data : null;
  const gospel = daily?.readings.find((r) => r.label === 'Gospel');
  const otherReadings = daily?.readings.filter((r) => r.label !== 'Gospel') ?? [];

  return (
    <div className={styles.readings} aria-busy={daily ? undefined : true}>
      <SectionTitle eyebrow="Liturgy of the Word" title="Today’s Readings" />
      {daily ? null : (
        <p className={styles['readings__sr-only']} role="status">
          Loading today’s readings…
        </p>
      )}

      <div className={styles['readings__liturgy-header']}>
        <div className={styles['readings__solemnity-info']}>
          <div className={styles['readings__day-cell']}>
            {daily ? (
              daily.celebrations.map((cel) => (
                <p key={cel} className={styles['readings__day-celebration']}>{cel}</p>
              ))
            ) : (
              <p className={styles['readings__day-celebration']}>
                <span className={skeleton('medium')} />
              </p>
            )}
          </div>
          <div
            className={styles['readings__season-badge']}
            style={{ backgroundColor: `var(${day.colourVar})` }}
          >
            <Image src="/icons/season-badge.svg" alt="" width={20} height={28} />
            <div>
              <p className={styles['readings__season-badge-name']}>{day.season}</p>
              <p className={styles['readings__season-badge-year']}>{day.lectionaryYear}</p>
            </div>
          </div>
        </div>

        {gospel || !daily ? (
          <div className={styles['readings__gospel-card']}>
            <div className={styles['readings__gospel-image']}>
              <Image
                src="/images/gospel_image.png"
                alt="Icon of Christ teaching"
                fill
                sizes="(min-width: 768px) 330px, 100vw"
                className={styles['readings__gospel-photo']}
              />
            </div>
            <div className={styles['readings__gospel-info']}>
              <span className={styles['readings__gospel-icon']}>
                <Image src="/icons/reading-cross.svg" alt="" width={72} height={72} />
              </span>
              <div
                className={[
                  styles['readings__gospel-text'],
                  gospel ? '' : styles['readings__gospel-text--loading'],
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <p className={styles['readings__gospel-label']}>Gospel</p>
                {gospel ? (
                  <>
                    <p className={styles['readings__gospel-reference']}>{gospel.reference}</p>
                    <p className={styles['readings__gospel-excerpt']}>{gospel.excerpt}</p>
                  </>
                ) : (
                  <>
                    <span className={`${skeleton('medium')} ${styles['readings__skeleton--heading']}`} />
                    <span className={skeleton('full')} />
                    <span className={skeleton('full')} />
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles['readings__other-readings']}>
        {daily
          ? otherReadings.map((reading) => (
              <div key={reading.label} className={styles['readings__reading-row']}>
                <span className={styles['readings__reading-icon']}>
                  <Image
                    src={READING_ICONS[reading.label] ?? '/icons/reading-bible.svg'}
                    alt=""
                    width={100}
                    height={100}
                  />
                </span>
                <div className={styles['readings__reading-info']}>
                  <p className={styles['readings__reading-label']}>{reading.label}</p>
                  <p className={styles['readings__reading-reference']}>{reading.reference}</p>
                  <p
                    className={
                      reading.label === 'Responsorial Psalm'
                        ? styles['readings__reading-chorus']
                        : styles['readings__reading-excerpt']
                    }
                  >
                    {reading.excerpt}
                  </p>
                </div>
              </div>
            ))
          : ['First Reading', 'Responsorial Psalm'].map((label) => (
              <div key={label} className={styles['readings__reading-row']} aria-hidden="true">
                <span className={styles['readings__reading-icon']}>
                  <Image
                    src={READING_ICONS[label] ?? '/icons/reading-bible.svg'}
                    alt=""
                    width={100}
                    height={100}
                  />
                </span>
                <div className={`${styles['readings__reading-info']} ${styles['readings__reading-info--loading']}`}>
                  <p className={styles['readings__reading-label']}>{label}</p>
                  <span className={skeleton('medium')} />
                  <span className={skeleton('full')} />
                </div>
              </div>
            ))}
      </div>

      <Button href="/readings" variant="outline" size="sm">
        Full Readings →
      </Button>
    </div>
  );
}
