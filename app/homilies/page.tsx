import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import { getHomilies } from '@/lib/homilies';
import HomilyArchive from './HomilyArchive';
import styles from './page.module.scss';

// ISR — revalidate every 10 minutes.
export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Homilies',
  description:
    'A searchable archive of homilies preached at the Catholic Church of the Ascension, with audio recordings from Mass.',
};

export default async function HomiliesPage(): Promise<React.JSX.Element> {
  const homilies = await getHomilies();

  return (
    <div className={styles.homilies}>
      <PageHeader
        eyebrow="The Word Proclaimed"
        title="Homilies"
        description="Listen again to the Word of God broken open at Mass — filter by priest or liturgical season."
      />
      <HomilyArchive homilies={homilies} />
    </div>
  );
}
