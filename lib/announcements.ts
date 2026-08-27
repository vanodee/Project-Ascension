import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '@sanity/image-url';
import { client } from '@/sanity/lib/client';
import { imageUrl } from '@/sanity/lib/image';
import { ANNOUNCEMENTS_QUERY, ANNOUNCEMENT_QUERY } from '@/sanity/lib/queries';
import type { Announcement, Society } from './types';

interface SocietyDoc {
  slug: string;
  name: string;
  shortName: string;
  color: string;
  societyType: Society['societyType'];
  logo: SanityImageSource;
}

interface AnnouncementDoc {
  title: string;
  slug: string;
  excerpt: string;
  body: PortableTextBlock[];
  image: SanityImageSource | null;
  society: SocietyDoc;
  pinned: boolean;
  publishedAt: string;
  expiresAt?: string;
  eventDate?: string;
  eventLocation?: string;
}

function toAnnouncement(doc: AnnouncementDoc): Announcement {
  return {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    body: doc.body,
    publishedAt: doc.publishedAt,
    ...(doc.expiresAt ? { expiresAt: doc.expiresAt } : {}),
    pinned: doc.pinned,
    image: doc.image ? imageUrl(doc.image, 1200) : null,
    society: {
      slug: doc.society.slug,
      name: doc.society.name,
      shortName: doc.society.shortName,
      color: doc.society.color,
      societyType: doc.society.societyType,
      logo: imageUrl(doc.society.logo, 200),
    },
    ...(doc.eventDate ? { eventDate: doc.eventDate } : {}),
    ...(doc.eventLocation ? { eventLocation: doc.eventLocation } : {}),
  };
}

/** Active announcements (expired items filtered server-side): pinned first, then most recent. */
export async function getAnnouncements(): Promise<Announcement[]> {
  const docs = await client.fetch<AnnouncementDoc[]>(ANNOUNCEMENTS_QUERY);
  return docs.map(toAnnouncement);
}

export async function getAnnouncement(slug: string): Promise<Announcement | undefined> {
  const doc = await client.fetch<AnnouncementDoc | null>(ANNOUNCEMENT_QUERY, { slug });
  return doc ? toAnnouncement(doc) : undefined;
}
