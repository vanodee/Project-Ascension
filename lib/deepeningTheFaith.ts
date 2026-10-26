import 'server-only';
import type { PortableTextBlock } from '@portabletext/types';
import { client } from '@/sanity/lib/client';
import { FAITH_MONTHS_QUERY, FAITH_REFLECTIONS_QUERY } from '@/sanity/lib/queries';
import { secondsUntilMidnight } from '@/lib/format';
import { monthKey } from '@/lib/faithArchive';
import type { FaithMonth, FaithReflection } from '@/lib/types';

interface FaithMonthDoc {
  year: number;
  month: number;
  theme: string | null;
}

interface FaithReflectionDoc {
  slug: string;
  date: string;
  year: number;
  month: number;
  topic: string;
  biblicalReferences: string[] | null;
  questions: string[] | null;
  teaching: PortableTextBlock[] | null;
  suggestedTask: string | null;
}

export interface FaithContent {
  months: FaithMonth[];
  reflections: FaithReflection[];
}

/**
 * Monthly themes plus every reflection dated on or before `today` (Lagos).
 * Both fetches expire from the Data Cache at the next Lagos midnight, so a
 * reflection scheduled for Sunday appears — and becomes "This week" — as that
 * day starts (`useCdn: false` avoids the CDN edge + Data Cache double-caching).
 */
export async function getFaithContent(today: string): Promise<FaithContent> {
  const opts = { useCdn: false, next: { revalidate: secondsUntilMidnight() } };

  const [monthDocs, reflectionDocs] = await Promise.all([
    client.fetch<FaithMonthDoc[]>(FAITH_MONTHS_QUERY, {}, opts),
    client.fetch<FaithReflectionDoc[]>(FAITH_REFLECTIONS_QUERY, { today }, opts),
  ]);

  return {
    months: monthDocs
      .filter((doc) => doc.theme)
      .map((doc) => ({
        key: monthKey(doc.year, doc.month),
        year: doc.year,
        month: doc.month,
        theme: doc.theme ?? '',
      })),
    reflections: reflectionDocs.map((doc) => ({
      slug: doc.slug,
      date: doc.date,
      monthKey: monthKey(doc.year, doc.month),
      topic: doc.topic,
      biblicalReferences: doc.biblicalReferences ?? [],
      questions: doc.questions ?? [],
      teaching: doc.teaching ?? [],
      suggestedTask: doc.suggestedTask ?? '',
    })),
  };
}
