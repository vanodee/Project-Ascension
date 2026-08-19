import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import { getAnnouncements } from '@/lib/announcements';
import { formatDate } from '@/lib/format';
import styles from './page.module.scss';

// ISR — announcements are timely content; revalidate every 10 minutes.
export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Announcements',
  description:
    'Parish notices, news, and updates from the Catholic Church of the Ascension, Ikeja, Lagos.',
};

export default async function AnnouncementsPage(): Promise<React.JSX.Element> {
  const announcements = await getAnnouncements();

  return (
    <div className={styles.announcements}>
      <PageHeader
        eyebrow="Parish Notices"
        title="Announcements"
        description="Timely notices, news, and updates for the parish community."
      />

      <div className={styles.announcements__grid}>
        {announcements.map((announcement) => (
          <Link
            key={announcement.slug}
            href={`/announcements/${announcement.slug}`}
            className={styles.announcements__card}
          >
            <span className={styles['announcements__card-image']}>
              <Image
                src={announcement.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className={styles['announcements__card-photo']}
              />
              {announcement.pinned ? (
                <span className={styles['announcements__card-tag']}>Pinned</span>
              ) : null}
            </span>
            <span className={styles['announcements__card-body']}>
              <span className={styles['announcements__card-meta']}>
                {formatDate(announcement.publishedAt)} •{' '}
                <span className={styles['announcements__card-category']}>
                  {announcement.category}
                </span>
              </span>
              <span className={styles['announcements__card-title']}>
                {announcement.title}
              </span>
              <span className={styles['announcements__card-excerpt']}>
                {announcement.excerpt}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
