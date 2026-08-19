import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '@sanity/image-url';
import { client } from '@/sanity/lib/client';
import { imageUrl } from '@/sanity/lib/image';
import { SACRAMENT_PAGES_QUERY } from '@/sanity/lib/queries';
import type { SacramentPage, SacramentKey } from './types';

interface SacramentPageDoc {
  sacrament: SacramentKey;
  title: string;
  label: string;
  summary: string;
  heroImage: SanityImageSource;
  body: PortableTextBlock[];
  tallyFormId?: string;
}

function toSacramentPage(doc: SacramentPageDoc): SacramentPage {
  return {
    sacrament: doc.sacrament,
    title: doc.title,
    label: doc.label,
    summary: doc.summary,
    heroImage: imageUrl(doc.heroImage, 1600),
    body: doc.body,
    ...(doc.tallyFormId ? { tallyFormId: doc.tallyFormId } : {}),
  };
}

const ORDER: SacramentKey[] = [
  'rcia',
  'baptism',
  'eucharist',
  'confirmation',
  'reconciliation',
  'anointing',
  'matrimony',
];

export async function getSacraments(): Promise<SacramentPage[]> {
  const docs = await client.fetch<SacramentPageDoc[]>(SACRAMENT_PAGES_QUERY);
  const pages = docs.map(toSacramentPage);
  return ORDER.map((key) => {
    const page = pages.find((p) => p.sacrament === key);
    if (!page) throw new Error(`Missing sacrament page: ${key}`);
    return page;
  });
}

export async function getSacrament(key: string): Promise<SacramentPage | undefined> {
  const pages = await getSacraments();
  return pages.find((s) => s.sacrament === key);
}

export function isSacramentKey(value: string): value is SacramentKey {
  return (ORDER as string[]).includes(value);
}
