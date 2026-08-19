import type { SanityImageSource } from '@sanity/image-url';
import { client } from '@/sanity/lib/client';
import { imageUrl } from '@/sanity/lib/image';
import { GALLERY_ALBUMS_QUERY, GALLERY_ALBUM_QUERY } from '@/sanity/lib/queries';
import type { GalleryAlbum, GalleryMediaItem } from './types';

const CATEGORY_LABELS: Record<string, GalleryAlbum['category']> = {
  liturgical: 'Liturgical',
  youth: 'Youth',
  outreach: 'Outreach',
  fundraiser: 'Fundraiser',
};

interface ImageWithAlt extends Record<string, unknown> {
  alt?: string;
}

interface MediaItemDoc {
  _type: 'imageItem' | 'videoItem';
  image?: ImageWithAlt;
  caption?: string;
  url?: string;
}

interface GalleryAlbumDoc {
  title: string;
  slug: string;
  eventDate: string;
  category: string;
  description: string;
  coverImage: SanityImageSource;
  media: MediaItemDoc[];
}

function toMediaItem(doc: MediaItemDoc): GalleryMediaItem {
  if (doc._type === 'videoItem') {
    return {
      type: 'video',
      url: doc.url ?? '',
      caption: doc.caption ?? '',
      altText: doc.caption ?? '',
    };
  }
  return {
    type: 'image',
    url: doc.image ? imageUrl(doc.image as SanityImageSource, 1600) : '',
    caption: doc.caption ?? '',
    altText: doc.image?.alt ?? doc.caption ?? '',
  };
}

function toGalleryAlbum(doc: GalleryAlbumDoc): GalleryAlbum {
  return {
    slug: doc.slug,
    title: doc.title,
    eventDate: doc.eventDate,
    category: CATEGORY_LABELS[doc.category] ?? 'Liturgical',
    coverImage: imageUrl(doc.coverImage, 1200),
    description: doc.description,
    media: doc.media.map(toMediaItem),
  };
}

export async function getAlbums(): Promise<GalleryAlbum[]> {
  const docs = await client.fetch<GalleryAlbumDoc[]>(GALLERY_ALBUMS_QUERY);
  return docs.map(toGalleryAlbum);
}

export async function getAlbum(slug: string): Promise<GalleryAlbum | undefined> {
  const doc = await client.fetch<GalleryAlbumDoc | null>(GALLERY_ALBUM_QUERY, { slug });
  return doc ? toGalleryAlbum(doc) : undefined;
}
