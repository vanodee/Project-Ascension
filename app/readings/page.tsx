import type { Metadata } from 'next';
import Image from 'next/image';
import PageHeader from '@/components/ui/PageHeader';
import { getDailyReadings } from '@/lib/readings';
import { formatDate } from '@/lib/format';
import styles from './page.module.scss';

// ISR safety valve: the fetch in getDailyReadings uses next.revalidate = secondsUntilMidnight(),
// so the data cache turns over at Lagos midnight. This segment-level value is a backstop only.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Daily Readings',
  description:
    'The Roman Catholic daily Mass readings — first reading, psalm, second reading, and Gospel — from the Universalis liturgical calendar.',
};

const READING_ICONS: Record<string, string> = {
  'First Reading': '/icons/reading-bible.svg',
  'Responsorial Psalm': '/icons/reading-harp.svg',
  'Second Reading': '/icons/reading-cross.svg',
  'Gospel': '/icons/reading-bible.svg',
};

export default async function ReadingsPage(): Promise<React.JSX.Element> {
  const daily = await getDailyReadings();

  return (
    <div className={styles.readings}>
      <PageHeader
        eyebrow="Liturgy of the Word"
        title="Daily Readings"
        description="The readings proclaimed at Mass today, given for the prayer and nourishment of the whole Church."
      />

      <p className={styles.readings__date}>{formatDate(daily.date)}</p>

      <div className={styles.readings__banner}>
        <div className={styles['readings__banner-day']}>
          {daily.celebrations.map((cel) => (
            <p key={cel} className={styles['readings__banner-celebration']}>{cel}</p>
          ))}
        </div>
        <div
          className={styles['readings__banner-season']}
          style={{ backgroundColor: `var(${daily.colourVar})` }}
        >
          <Image src="/icons/season-badge.svg" alt="" width={24} height={32} />
          <div>
            <p className={styles['readings__banner-season-name']}>{daily.season}</p>
            <p className={styles['readings__banner-season-year']}>{daily.lectionaryYear}</p>
          </div>
        </div>
      </div>

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
    </div>
  );
}
