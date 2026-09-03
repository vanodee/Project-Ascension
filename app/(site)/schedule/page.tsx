import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import { getLagosToday, getScheduleData } from '@/lib/schedule';
import ScheduleView from './ScheduleView';
import styles from './page.module.scss';

// ISR backstop only — `getScheduleData`'s Sanity fetch carries a
// `secondsUntilMidnight()` TTL, so the schedule turns over at Lagos midnight
// (and on the webhook when a recurringEvent / parishEvent is edited).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Parish Schedule',
  description:
    'Upcoming Masses, confessions, novenas, meetings, and events at the Catholic Church of the Ascension, Ikeja, Lagos.',
};

export default async function SchedulePage(): Promise<React.JSX.Element> {
  const today = getLagosToday();
  const data = await getScheduleData(today);

  return (
    <div className={styles.schedule}>
      <PageHeader
        eyebrow="Life of the Parish"
        title="Parish Schedule"
        description="Masses, confessions, devotions, meetings, and celebrations — everything happening in the parish."
      />
      <ScheduleView data={data} today={today} />
    </div>
  );
}
