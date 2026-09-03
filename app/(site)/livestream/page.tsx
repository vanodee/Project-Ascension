import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { getLivestreamStatus } from '@/lib/livestream';
import { getLagosToday, getScheduleData } from '@/lib/schedule';
import { getScheduleWeek } from '@/lib/calendar';
import styles from './page.module.scss';

// ISR — live status revalidates every minute (keyless YouTube scrape, server-side).
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Livestream',
  description:
    'Watch live from the Catholic Church of the Ascension, Ikeja, Lagos — Sunday Mass, ordinations, and parish celebrations — or replay the most recent broadcast.',
};

export default async function LivestreamPage(): Promise<React.JSX.Element> {
  const today = getLagosToday();
  const [stream, scheduleData] = await Promise.all([
    getLivestreamStatus(),
    getScheduleData(today),
  ]);
  const week = getScheduleWeek(scheduleData, today);

  return (
    <div className={styles.livestream}>
      <PageHeader
        eyebrow="Join Us From Anywhere"
        title="Parish Livestream"
        description={
          stream.isLive
            ? 'We are live now — join us in prayer and worship.'
            : 'We are not live at the moment. Watch the most recent broadcast below, and join us for the next celebration.'
        }
      />

      <div className={styles.livestream__player}>
        {stream.isLive ? (
          <p className={styles.livestream__badge}>
            <span className={styles['livestream__badge-dot']} aria-hidden />
            Live{typeof stream.viewerCount === 'number' ? ` • ${stream.viewerCount} watching` : ''}
          </p>
        ) : (
          <p className={`${styles.livestream__badge} ${styles['livestream__badge--recorded']}`}>
            Most Recent Broadcast
          </p>
        )}
        <div className={styles.livestream__frame}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${stream.videoId}`}
            title={stream.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.livestream__iframe}
          />
        </div>
        <p className={styles.livestream__title}>{stream.title}</p>
      </div>

      <section className={styles.livestream__info}>
        <div className={styles['livestream__info-block']}>
          <p className={styles['livestream__info-label']}>When We Stream</p>
          <div className={styles['livestream__mass-group']}>
            <p className={styles['livestream__mass-heading']}>{week.sundayLabel}</p>
            {week.sundayMasses.map((mass) => (
              <p key={`${mass.title}-${mass.time}`} className={styles['livestream__mass-time']}>
                {mass.title} · {mass.time}
              </p>
            ))}
          </div>
        </div>
        <div className={styles['livestream__info-block']}>
          <p className={styles['livestream__info-label']}>Joining Virtually</p>
          <p className={styles['livestream__info-text']}>
            Find a quiet place, set aside what can wait, and join your prayer to the
            community gathered in the church. However you are watching — Sunday Mass, an
            ordination, a night of praise — you are welcome, and you are not praying alone.
          </p>
          <p className={styles['livestream__info-text']}>
            For Sunday Mass in particular: a livestream does not fulfil the obligation to
            attend in person for those who are able, but it is a true means of grace for
            the homebound, the sick, and those far from home. Light a candle if you can,
            and keep the prayerful attention you would bring to the pew.
          </p>
          <Button href="/schedule" variant="outline" size="sm">
            View Full Schedule →
          </Button>
        </div>
      </section>
    </div>
  );
}
