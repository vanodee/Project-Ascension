import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import { getUpcomingEvents } from '@/lib/calendar';
import ScheduleView from './ScheduleView';
import styles from './page.module.scss';

// ISR — parish calendar revalidates every hour (Google Calendar API).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Parish Schedule',
  description:
    'Upcoming Masses, confessions, novenas, meetings, and events at the Catholic Church of the Ascension, Ikeja, Lagos.',
};

export default async function SchedulePage(): Promise<React.JSX.Element> {
  const events = await getUpcomingEvents();

  return (
    <div className={styles.schedule}>
      <PageHeader
        eyebrow="Life of the Parish"
        title="Parish Schedule"
        description="Masses, confessions, devotions, meetings, and celebrations — everything happening in the parish."
      />
      <ScheduleView events={events} />
    </div>
  );
}
