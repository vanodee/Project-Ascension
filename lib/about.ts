import type { PortableTextBlock } from '@portabletext/types';
import { client } from '@/sanity/lib/client';
import { ABOUT_PAGE_QUERY } from '@/sanity/lib/queries';
import type { AboutMilestone, AboutPage, AboutStat } from './types';

interface AboutPageDoc {
  body: PortableTextBlock[];
  scriptureQuote: { text: string; reference: string } | null;
  stats: AboutStat[] | null;
  missionStatement: string;
  milestones: AboutMilestone[] | null;
}

export async function getAboutPage(): Promise<AboutPage> {
  const doc = await client.fetch<AboutPageDoc>(ABOUT_PAGE_QUERY);
  return {
    body: doc.body,
    scriptureQuote: doc.scriptureQuote ?? null,
    stats: doc.stats ?? [],
    missionStatement: doc.missionStatement,
    milestones: doc.milestones ?? [],
  };
}
