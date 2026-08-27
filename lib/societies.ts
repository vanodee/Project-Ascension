import type { SanityImageSource } from '@sanity/image-url';
import { client } from '@/sanity/lib/client';
import { imageUrl } from '@/sanity/lib/image';
import { SOCIETIES_QUERY, SOCIETY_QUERY } from '@/sanity/lib/queries';
import type { Society, SocietyDetail, SocietySlogan, SocietyType } from './types';
import type { PortableTextBlock } from '@portabletext/types';

interface SocietyDoc {
  slug: string;
  name: string;
  shortName: string;
  color: string;
  societyType: Society['societyType'];
  logo: SanityImageSource;
}

interface SocietyDetailDoc extends SocietyDoc {
  subtitle?: string;
  slogan?: SocietySlogan;
  description?: PortableTextBlock[];
  zonePatron?: string;
  established?: string;
  meetingDay?: string;
  zoneLeader?: string[];
  contact?: string[];
}

// Canonical type ordering — drives both the grid's grouping and the filter pill order.
export const SOCIETY_TYPE_ORDER: SocietyType[] = [
  'parish_zone',
  'demographic_organization',
  'pious_devotional',
  'charismatic_movement',
  'knightly_professional',
  'liturgical_ministry',
  'general',
];

export async function getSocieties(): Promise<Society[]> {
  // Query orders by creation date (oldest first); the sort below groups by type
  // while preserving that date order within each group (Array#sort is stable).
  const docs = await client.fetch<SocietyDoc[]>(SOCIETIES_QUERY);
  return docs
    .map((doc) => ({
      slug: doc.slug,
      name: doc.name,
      shortName: doc.shortName,
      color: doc.color,
      societyType: doc.societyType,
      logo: imageUrl(doc.logo, 600),
    }))
    .sort(
      (a, b) =>
        SOCIETY_TYPE_ORDER.indexOf(a.societyType) - SOCIETY_TYPE_ORDER.indexOf(b.societyType),
    );
}

export async function getSociety(slug: string): Promise<SocietyDetail | undefined> {
  const doc = await client.fetch<SocietyDetailDoc | null>(SOCIETY_QUERY, { slug });
  if (!doc) return undefined;

  return {
    slug: doc.slug,
    name: doc.name,
    shortName: doc.shortName,
    color: doc.color,
    societyType: doc.societyType,
    logo: imageUrl(doc.logo, 600),
    ...(doc.subtitle ? { subtitle: doc.subtitle } : {}),
    ...(doc.slogan ? { slogan: doc.slogan } : {}),
    ...(doc.description ? { description: doc.description } : {}),
    ...(doc.zonePatron ? { zonePatron: doc.zonePatron } : {}),
    ...(doc.established ? { established: doc.established } : {}),
    ...(doc.meetingDay ? { meetingDay: doc.meetingDay } : {}),
    ...(doc.zoneLeader?.length ? { zoneLeader: doc.zoneLeader } : {}),
    ...(doc.contact?.length ? { contact: doc.contact } : {}),
  };
}
