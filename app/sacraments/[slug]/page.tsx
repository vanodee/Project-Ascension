import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Button from '@/components/ui/Button';
import TallyEmbed from '@/components/ui/TallyEmbed';
import { getSacraments, getSacrament } from '@/lib/sacraments';
import styles from './page.module.scss';

// SSG — all 7 sacrament pages pre-rendered at build time.

interface SacramentRouteParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const sacraments = await getSacraments();
  return sacraments.map((s) => ({ slug: s.sacrament }));
}

export async function generateMetadata({ params }: SacramentRouteParams): Promise<Metadata> {
  const { slug } = await params;
  const sacrament = await getSacrament(slug);
  if (!sacrament) return {};
  return {
    title: sacrament.title,
    description: sacrament.summary,
  };
}

export default async function SacramentDetailPage({
  params,
}: SacramentRouteParams): Promise<React.JSX.Element> {
  const { slug } = await params;
  const sacrament = await getSacrament(slug);
  if (!sacrament) notFound();

  return (
    <article className={styles.sacrament}>
      <header className={styles.sacrament__header}>
        <p className={styles.sacrament__eyebrow}>{sacrament.label}</p>
        <h1 className={styles.sacrament__title}>{sacrament.title}</h1>
        <p className={styles.sacrament__summary}>{sacrament.summary}</p>
      </header>

      <div className={styles.sacrament__hero}>
        <Image
          src={sacrament.heroImage}
          alt=""
          fill
          sizes="(min-width: 1400px) 1400px, 100vw"
          className={styles['sacrament__hero-image']}
        />
      </div>

      <div className={styles.sacrament__body}>
        {sacrament.body.map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className={styles.sacrament__paragraph}>
            {paragraph}
          </p>
        ))}
      </div>

      {sacrament.tallyFormId ? (
        <section className={styles.sacrament__form} aria-label="RCIA enquiry form">
          <h2 className={styles['sacrament__form-title']}>Make an Enquiry</h2>
          <TallyEmbed formId={sacrament.tallyFormId} title="RCIA Enquiry" />
        </section>
      ) : null}

      <footer className={styles.sacrament__footer}>
        <Button href="/sacraments" variant="outline" size="sm">
          ← All Sacraments
        </Button>
        <Button href="/contact" variant="outline" size="sm">
          Contact the Parish →
        </Button>
      </footer>
    </article>
  );
}
