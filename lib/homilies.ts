import type { PortableTextBlock } from '@portabletext/types';
import { client } from '@/sanity/lib/client';
import { HOMILIES_QUERY, HOMILY_QUERY } from '@/sanity/lib/queries';
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
  scriptureReference: string;
  liturgicalSeason: string;
  body: PortableTextBlock[];
  audioUrl: string | null;
  audioDuration: string;
}

function toHomily(doc: HomilyDoc): Homily {
  return {
    slug: doc.slug,
    title: doc.title,
    authorSlug: doc.authorSlug,
    authorName: doc.authorName,
    publishedAt: doc.publishedAt,
    scriptureReference: doc.scriptureReference,
    liturgicalSeason: SEASON_LABELS[doc.liturgicalSeason] ?? 'Ordinary Time',
    body: doc.body,
    audioUrl: doc.audioUrl ?? '',
    audioDuration: doc.audioDuration,
  };
}

export async function getHomilies(): Promise<Homily[]> {
  const docs = await client.fetch<HomilyDoc[]>(HOMILIES_QUERY);
  return docs.map(toHomily);
}

export async function getHomily(slug: string): Promise<Homily | undefined> {
  const doc = await client.fetch<HomilyDoc | null>(HOMILY_QUERY, { slug });
  return doc ? toHomily(doc) : undefined;
}
