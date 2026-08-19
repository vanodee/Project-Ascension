import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '@sanity/image-url';
import { client } from '@/sanity/lib/client';
import { imageUrl } from '@/sanity/lib/image';
import { ABOUT_PAGE_QUERY } from '@/sanity/lib/queries';
import type { AboutPage } from './types';

interface AboutPageDoc {
  title: string;
  heroImage: SanityImageSource;
  missionStatement: string;
  body: PortableTextBlock[];
}

export async function getAboutPage(): Promise<AboutPage> {
  const doc = await client.fetch<AboutPageDoc>(ABOUT_PAGE_QUERY);
  return {
    title: doc.title,
    heroImage: imageUrl(doc.heroImage, 1600),
    missionStatement: doc.missionStatement,
    body: doc.body,
  };
}
