import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Button from '@/components/ui/Button';
import { getAnnouncements, getAnnouncement } from '@/lib/announcements';
import { formatDate, formatTime } from '@/lib/format';
import styles from './page.module.scss';

// ISR — revalidate every 10 minutes.
export const revalidate = 600;

interface AnnouncementRouteParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const announcements = await getAnnouncements();
  return announcements.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: AnnouncementRouteParams): Promise<Metadata> {
  const { slug } = await params;
  const announcement = await getAnnouncement(slug);
  if (!announcement) return {};
  return {
    title: announcement.title,
    description: announcement.excerpt,
  };
}

export default async function AnnouncementDetailPage({
  params,
}: AnnouncementRouteParams): Promise<React.JSX.Element> {
  const { slug } = await params;
  const announcement = await getAnnouncement(slug);
  if (!announcement) notFound();

  return (
    <article className={styles.announcement}>
      <header className={styles.announcement__header}>
        <p className={styles.announcement__meta}>
          {formatDate(announcement.publishedAt)} •{' '}
          <span className={styles.announcement__category}>{announcement.category}</span>
        </p>
        <h1 className={styles.announcement__title}>{announcement.title}</h1>
        {announcement.eventDate ? (
          <p className={styles['announcement__event-meta']}>
            <Image src="/icons/calendar.svg" alt="" width={24} height={24} />
            <span>
              {formatDate(announcement.eventDate)} • {formatTime(announcement.eventDate)}
            </span>
          </p>
        ) : null}
        {announcement.eventLocation ? (
          <p className={styles['announcement__event-meta']}>
            <Image src="/icons/location.svg" alt="" width={24} height={24} />
            <span>{announcement.eventLocation}</span>
          </p>
        ) : null}
      </header>

      <div className={styles.announcement__hero}>
        <Image
          src={announcement.image}
          alt=""
          fill
          sizes="(min-width: 900px) 900px, 100vw"
          className={styles['announcement__hero-image']}
        />
      </div>

      <div className={styles.announcement__body}>
        {announcement.body.map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className={styles.announcement__paragraph}>
            {paragraph}
          </p>
        ))}
      </div>

      <footer className={styles.announcement__footer}>
        <Button href="/announcements" variant="outline" size="sm">
          ← All Announcements
        </Button>
      </footer>
    </article>
  );
}
