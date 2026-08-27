import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import { getAnnouncements } from '@/lib/announcements';
import AnnouncementsGrid from './AnnouncementsGrid';
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

      <AnnouncementsGrid announcements={announcements} />
    </div>
  );
}
