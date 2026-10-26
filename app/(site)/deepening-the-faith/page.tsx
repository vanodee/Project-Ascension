import PageHeader from '@/components/ui/PageHeader';
import { getFaithContent } from '@/lib/deepeningTheFaith';
import { buildArchive, defaultMonthKey, pickFeatured } from '@/lib/faithArchive';
import { buildPageMetadata } from '@/lib/metadata';
import { getLagosToday } from '@/lib/schedule';
import FaithBrowser from './FaithBrowser';
import styles from './page.module.scss';

// ISR safety valve: the fetches in getFaithContent use next.revalidate =
// secondsUntilMidnight(), so a reflection dated for Sunday appears (and becomes
// "This week") as that Lagos day starts. This 1 h segment TTL is the backstop;
// publishes in Studio revalidate immediately via the webhook.
export const revalidate = 3600;

export const metadata = buildPageMetadata({
  path: '/deepening-the-faith',
  title: 'Deepening the Faith',
  description:
    'A monthly theme and a weekly teaching from Sunday Mass at the Catholic Church of the Ascension — scripture, questions to ponder, and a task for the week.',
});

export default async function DeepeningTheFaithPage(): Promise<React.JSX.Element> {
  const today = getLagosToday();
  const { months, reflections } = await getFaithContent(today);
  const archive = buildArchive(months, reflections, today);

  return (
    <div className={styles.faith}>
      <PageHeader
        eyebrow="Formation at Sunday Mass"
        title="Deepening the Faith"
        description="A monthly theme. A weekly teaching. A faith lived beyond Sunday Mass."
      />

      <div className={styles.faith__content}>
        <FaithBrowser
          featured={pickFeatured(months, reflections, today)}
          archive={archive}
          initialMonthKey={defaultMonthKey(archive, today)}
          reflections={reflections}
        />
      </div>
    </div>
  );
}
