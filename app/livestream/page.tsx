import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { getLivestreamStatus } from '@/lib/livestream';
import { siteSettings } from '@/lib/site';
import styles from './page.module.scss';

// ISR — live status revalidates every 5 minutes (YouTube Data API v3, server-side).
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Livestream',
  description:
    'Watch Mass live from the Catholic Church of the Ascension, Ikeja, Lagos — or replay the most recent recorded Mass.',
};

export default async function LivestreamPage(): Promise<React.JSX.Element> {
  const stream = await getLivestreamStatus();

  return (
    <div className={styles.livestream}>
      <PageHeader
        eyebrow="Join Us From Anywhere"
        title="Mass Livestream"
        description={
          stream.isLive
            ? 'We are live now — join the celebration of Holy Mass.'
            : 'We are not live at the moment. Watch the most recent Mass below, and join us at the next scheduled livestream.'
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
            Most Recent Mass
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
          {siteSettings.massTimes
            .filter((group) => group.heading !== 'Location')
            .map((group) => (
              <div key={group.heading} className={styles['livestream__mass-group']}>
                <p className={styles['livestream__mass-heading']}>{group.heading}</p>
                {group.times.map((time) => (
                  <p key={time} className={styles['livestream__mass-time']}>
                    {time}
                  </p>
                ))}
              </div>
            ))}
        </div>
        <div className={styles['livestream__info-block']}>
          <p className={styles['livestream__info-label']}>Joining Virtually</p>
          <p className={styles['livestream__info-text']}>
            Prepare a quiet place, light a candle if you can, and unite your prayer with
            the parish community. While a televised Mass does not replace the Sunday
            obligation for those able to attend, it is a true means of grace for the
            homebound and those far from home.
          </p>
          <Button href="/schedule" variant="outline" size="sm">
            View Full Schedule →
          </Button>
        </div>
      </section>
    </div>
  );
}
