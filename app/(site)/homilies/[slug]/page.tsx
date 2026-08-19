import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import Button from '@/components/ui/Button';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { getHomilies, getHomily } from '@/lib/homilies';
import { formatDate } from '@/lib/format';
import { paragraphComponents, toPlainText } from '@/lib/portableText';
import styles from './page.module.scss';

// ISR — revalidate every 10 minutes.
export const revalidate = 600;

interface HomilyRouteParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const homilies = await getHomilies();
  return homilies.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: HomilyRouteParams): Promise<Metadata> {
  const { slug } = await params;
  const homily = await getHomily(slug);
  if (!homily) return {};
  return {
    title: homily.title,
    description: `${homily.authorName} on ${homily.scriptureReference} — ${toPlainText(homily.body.slice(0, 1))}`,
  };
}

export default async function HomilyDetailPage({
  params,
}: HomilyRouteParams): Promise<React.JSX.Element> {
  const { slug } = await params;
  const homily = await getHomily(slug);
  if (!homily) notFound();

  return (
    <article className={styles.homily}>
      <header className={styles.homily__header}>
        <p className={styles.homily__meta}>
          {formatDate(homily.publishedAt)} • {homily.liturgicalSeason}
        </p>
        <h1 className={styles.homily__title}>{homily.title}</h1>
        <p className={styles.homily__author}>
          <Link href="/clergy" className={styles['homily__author-link']}>
            {homily.authorName}
          </Link>{' '}
          — {homily.scriptureReference}
        </p>
      </header>

      <AudioPlayer
        src={homily.audioUrl}
        title={`${homily.title} (${homily.scriptureReference})`}
        duration={homily.audioDuration}
      />

      <div className={styles.homily__body}>
        <PortableText
          value={homily.body}
          components={paragraphComponents(styles.homily__paragraph)}
        />
      </div>

      <footer className={styles.homily__footer}>
        <Button href="/homilies" variant="outline" size="sm">
          ← All Homilies
        </Button>
      </footer>
    </article>
  );
}
