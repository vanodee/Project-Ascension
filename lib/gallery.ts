import type { GalleryAlbum } from './types';

// Mirrors the `galleryAlbum` collection in Sanity (media on Cloudinary).
// Mocked until the CMS is wired up.
const albums: GalleryAlbum[] = [
  {
    slug: 'ycp-induction-may-2026',
    title: 'YCP Induction',
    eventDate: '2026-05-10',
    category: 'Youth',
    coverImage: '/images/gallery-1.jpg',
    description:
      'Induction ceremony of new members into the Young Catholic Professionals, followed by a reception at the parish hall.',
    media: [
      { type: 'image', url: '/images/gallery-1.jpg', caption: 'New members take the YCP pledge', altText: 'Young Catholic Professionals members standing together at their induction' },
      { type: 'image', url: '/images/gallery-4.jpg', caption: 'Group photograph after Mass', altText: 'Group photograph of parishioners outside the church' },
      { type: 'image', url: '/images/gallery-5.jpg', caption: 'Reception at the parish hall', altText: 'Parishioners at the reception in the parish hall' },
    ],
  },
  {
    slug: 'first-holy-communion-april-2026',
    title: 'First Holy Communion',
    eventDate: '2026-04-19',
    category: 'Liturgical',
    coverImage: '/images/gallery-2.jpg',
    description:
      'Children of the parish receive Our Lord in the Holy Eucharist for the first time.',
    media: [
      { type: 'image', url: '/images/gallery-2.jpg', caption: 'First communicants in procession', altText: 'Children in white processing into the church for First Holy Communion' },
      { type: 'image', url: '/images/gospel-photo.png', caption: 'The Liturgy of the Eucharist', altText: 'The celebrant elevating the host during Mass' },
      { type: 'image', url: '/images/gallery-3.jpg', caption: 'Thanksgiving after Mass', altText: 'Families gathered for thanksgiving after the First Communion Mass' },
    ],
  },
  {
    slug: 'cultural-day-october-2025',
    title: 'Cultural Day',
    eventDate: '2025-10-05',
    category: 'Fundraiser',
    coverImage: '/images/gallery-3.jpg',
    description:
      'A celebration of the cultures of our parish family, with traditional attire, dance, and a harvest fundraiser.',
    media: [
      { type: 'image', url: '/images/gallery-3.jpg', caption: 'Parishioners in traditional attire', altText: 'Parishioners dressed in colourful traditional attire on Cultural Day' },
      { type: 'image', url: '/images/gallery-1.jpg', caption: 'Cultural dance presentation', altText: 'Dancers performing during the Cultural Day celebration' },
    ],
  },
  {
    slug: 'legion-of-mary-love-feast-june-2025',
    title: 'Legion of Mary, Love Feast',
    eventDate: '2025-06-22',
    category: 'Outreach',
    coverImage: '/images/gallery-4.jpg',
    description:
      'The Legion of Mary hosts its annual Love Feast for members and auxiliaries.',
    media: [
      { type: 'image', url: '/images/gallery-4.jpg', caption: 'Members at the Love Feast', altText: 'Legion of Mary members seated together at the Love Feast' },
      { type: 'image', url: '/images/gallery-5.jpg', caption: 'Sharing a meal together', altText: 'Parishioners sharing a meal at the Legion of Mary Love Feast' },
    ],
  },
  {
    slug: 'professionals-day-april-2025',
    title: 'Professionals Day',
    eventDate: '2025-04-27',
    category: 'Outreach',
    coverImage: '/images/gallery-5.jpg',
    description:
      'Thanksgiving Mass and career mentorship session organised by the parish professionals’ guild.',
    media: [
      { type: 'image', url: '/images/gallery-5.jpg', caption: 'Thanksgiving procession', altText: 'Parish professionals in procession during the thanksgiving Mass' },
      { type: 'image', url: '/images/gallery-2.jpg', caption: 'Mentorship session', altText: 'A mentorship session during Professionals Day' },
    ],
  },
];

export async function getAlbums(): Promise<GalleryAlbum[]> {
  return [...albums].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
  );
}

export async function getAlbum(slug: string): Promise<GalleryAlbum | undefined> {
  return albums.find((album) => album.slug === slug);
}
