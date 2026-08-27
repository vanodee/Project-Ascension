import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import { getSocieties } from '@/lib/societies';
import SocietiesGrid from './SocietiesGrid';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Our Societies',
  description:
    'The groups, ministries, and movements that make up the life of our parish — united in faith, service, and fellowship.',
};

export default async function SocietiesPage(): Promise<React.JSX.Element> {
  const societies = await getSocieties();

  return (
    <div className={styles.societies}>
      <PageHeader
        eyebrow="Our Parish"
        title="Our Societies"
        description="The groups, ministries, and movements that make up the life of our parish — united in faith, service, and fellowship."
      />

      <SocietiesGrid societies={societies} />
    </div>
  );
}
