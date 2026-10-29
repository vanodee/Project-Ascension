import PageHeader from '@/components/ui/PageHeader';
import { lagosToday } from '@/lib/format';
import { buildPageMetadata } from '@/lib/metadata';
import DailyReadings from './DailyReadings';
import styles from './page.module.scss';

// The readings themselves load in the visitor's browser (Universalis only serves
// its JSONP feed to browsers — see lib/readings.ts). The server renders the shell
// plus the date and liturgical season; this hourly backstop keeps that date
// current, and DailyReadings swaps in the browser's Lagos date if the cached
// page predates midnight.
export const revalidate = 3600;

export const metadata = buildPageMetadata({
  path: '/readings',
  title: 'Daily Readings',
  description:
    'The Roman Catholic daily Mass readings — first reading, psalm, second reading, and Gospel — from the Universalis liturgical calendar.',
});

export default function ReadingsPage(): React.JSX.Element {
  return (
    <div className={styles.readings}>
      <PageHeader
        eyebrow="Liturgy of the Word"
        title="Daily Readings"
        description="The readings proclaimed at Mass today, given for the prayer and nourishment of the whole Church."
      />
      <DailyReadings serverDate={lagosToday()} />
    </div>
  );
}
