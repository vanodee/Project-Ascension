import type { Metadata } from 'next';
import Image from 'next/image';
import PageHeader from '@/components/ui/PageHeader';
import { getDailyReadings } from '@/lib/readings';
import { formatDate } from '@/lib/format';
import styles from './page.module.scss';

// ISR — readings change at midnight. Segment-level revalidate must be a static
// constant, so we use 1 hour here; when the real Universalis fetch is wired up,
// pass `next: { revalidate: secondsUntilMidnight() }` on the fetch itself.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Daily Readings',
  description:
    'The Roman Catholic daily Mass readings — first reading, psalm, second reading, and Gospel — from the Universalis liturgical calendar.',
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

      <div className={styles.readings__banner}>
        <p className={styles['readings__banner-day']}>
          {formatDate(daily.date)} — {daily.liturgicalDay} • {daily.lectionaryYear}
        </p>
        <p className={styles['readings__banner-season']}>
          <Image src="/icons/season-badge.svg" alt="" width={24} height={32} />
          <span>{daily.season} Season</span>
        </p>
      </div>

      <div className={styles.readings__list}>
        {daily.readings.map((reading) => (
          <section key={reading.label} className={styles.readings__reading}>
            <header className={styles['readings__reading-header']}>
              <p className={styles['readings__reading-label']}>{reading.label}</p>
              <h2 className={styles['readings__reading-reference']}>{reading.reference}</h2>
            </header>
            <div className={styles['readings__reading-text']}>
              {reading.text.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className={styles.readings__paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className={styles.readings__attribution}>
        Readings courtesy of the Universalis liturgical calendar.
      </p>
    </div>
  );
}
