import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { getSacraments } from '@/lib/sacraments';
import styles from './page.module.scss';

// SSG — content changes infrequently, managed in Sanity (sacramentPage collection).

export const metadata: Metadata = {
  title: 'Sacraments',
  description:
    'The seven sacraments celebrated at the Catholic Church of the Ascension — and the RCIA pathway for those called to the Catholic faith.',
};

export default async function SacramentsPage(): Promise<React.JSX.Element> {
  const sacraments = await getSacraments();
  const rcia = sacraments.find((s) => s.sacrament === 'rcia');
  const sevenSacraments = sacraments.filter((s) => s.sacrament !== 'rcia');

  return (
    <div className={styles.sacraments}>
      <PageHeader
        eyebrow="Channels of Grace"
        title="The Sacraments"
        description="The sacraments are efficacious signs of grace, instituted by Christ and entrusted to the Church, by which divine life is dispensed to us."
      />

      <div className={styles.sacraments__grid}>
        {sevenSacraments.map((sacrament) => (
          <Link
            key={sacrament.sacrament}
            href={`/sacraments/${sacrament.sacrament}`}
            className={styles.sacraments__card}
          >
            <span className={styles['sacraments__card-image']}>
              <Image
                src={sacrament.heroImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className={styles['sacraments__card-photo']}
              />
            </span>
            <span className={styles['sacraments__card-body']}>
              <span className={styles['sacraments__card-label']}>{sacrament.label}</span>
              <span className={styles['sacraments__card-title']}>{sacrament.title}</span>
              <span className={styles['sacraments__card-summary']}>{sacrament.summary}</span>
            </span>
          </Link>
        ))}
      </div>

      {rcia ? (
        <section className={styles.sacraments__rcia}>
          <div className={styles['sacraments__rcia-content']}>
            <p className={styles['sacraments__rcia-eyebrow']}>{rcia.label}</p>
            <h2 className={styles['sacraments__rcia-title']}>Becoming Catholic</h2>
            <p className={styles['sacraments__rcia-text']}>{rcia.summary}</p>
            <Button href="/sacraments/rcia" variant="ghost-inverse" size="lg">
              Begin Your Journey →
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
