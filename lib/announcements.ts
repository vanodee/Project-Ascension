import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '@sanity/image-url';
import { client } from '@/sanity/lib/client';
import { imageUrl } from '@/sanity/lib/image';
import { ANNOUNCEMENTS_QUERY, ANNOUNCEMENT_QUERY } from '@/sanity/lib/queries';
import type { Announcement } from './types';

interface AnnouncementDoc {
  title: string;
  slug: string;
  excerpt: string;
  body: PortableTextBlock[];
  image: SanityImageSource;
  category: Announcement['category'];
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
    category: doc.category,
    image: imageUrl(doc.image, 1200),
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
