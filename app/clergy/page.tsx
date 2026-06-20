import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import { getClergy } from '@/lib/clergy';
import ClergyGrid from './ClergyGrid';
import styles from './page.module.scss';

// SSG — clergy profiles change infrequently, managed in Sanity (clergyMember).

export const metadata: Metadata = {
  title: 'Our Clergy',
  description:
    'Meet the priests, reverend sisters, and catechists of the Catholic Church of the Ascension, Ikeja, Lagos.',
};

export default async function ClergyPage(): Promise<React.JSX.Element> {
  const members = await getClergy();

  return (
    <div className={styles.clergy}>
      <PageHeader
        eyebrow="Shepherds of the Flock"
        title="Our Clergy"
        description="The priests, reverend sisters, and catechists who serve our parish family."
      />
      <ClergyGrid members={members} />
    </div>
  );
}
