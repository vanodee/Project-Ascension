import type { PortableTextBlock } from '@portabletext/types';
import { client } from '@/sanity/lib/client';
import { HOMILIES_QUERY } from '@/sanity/lib/queries';
import type { Homily, LiturgicalSeason } from './types';

const SEASON_LABELS: Record<string, LiturgicalSeason> = {
  advent: 'Advent',
  christmas: 'Christmas',
  lent: 'Lent',
  easter: 'Easter',
  ordinary: 'Ordinary Time',
};

interface HomilyDoc {
  title: string;
  slug: string;
  authorSlug: string;
  authorName: string;
  publishedAt: string;
  scriptureReferences: string[] | null;
  liturgicalSeason: string;
  body: PortableTextBlock[] | null;
  audioUrl: string | null;
  audioDurationSeconds: number | null;
}

function toHomily(doc: HomilyDoc): Homily {
  return {
    slug: doc.slug,
    title: doc.title,
    authorSlug: doc.authorSlug,
    authorName: doc.authorName,
    publishedAt: doc.publishedAt,
    scriptureReferences: doc.scriptureReferences ?? [],
    liturgicalSeason: SEASON_LABELS[doc.liturgicalSeason] ?? 'Ordinary Time',
    // `body` is required in the schema going forward, but a document created
    // before that rule existed could still lack it — fall back rather than
    // hand PortableText a `null` that its declared type doesn't allow for.
    body: doc.body ?? [],
    audioUrl: doc.audioUrl ?? '',
    audioDurationSeconds: doc.audioDurationSeconds ?? 0,
  };
}

export async function getHomilies(): Promise<Homily[]> {
  const docs = await client.fetch<HomilyDoc[]>(HOMILIES_QUERY);
  return docs.map(toHomily);
}
