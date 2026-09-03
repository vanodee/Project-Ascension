import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteUrl';
import { getSacraments } from '@/lib/sacraments';
import { getSocieties } from '@/lib/societies';
import { getAlbums } from '@/lib/gallery';

// Regenerated on the same cadence as the most frequently-changing content.
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

const STATIC_ROUTES: { path: string; changeFrequency: Entry['changeFrequency']; priority: number }[] =
  [
    { path: '/', changeFrequency: 'weekly', priority: 1 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/clergy', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/sacraments', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/announcements', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/homilies', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/gallery', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/societies', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/schedule', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/readings', changeFrequency: 'daily', priority: 0.6 },
    { path: '/livestream', changeFrequency: 'weekly', priority: 0.7 },
  ];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: Entry[] = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Dynamic routes come from Sanity — if that fetch fails, still ship the static map.
  try {
    const [sacraments, societies, albums] = await Promise.all([
      getSacraments(),
      getSocieties(),
      getAlbums(),
    ]);

    for (const s of sacraments) {
      entries.push({
        url: `${SITE_URL}/sacraments/${s.sacrament}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
    for (const s of societies) {
      entries.push({
        url: `${SITE_URL}/societies/${s.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
    for (const a of albums) {
      entries.push({
        url: `${SITE_URL}/gallery/${a.slug}`,
        lastModified: now,
        changeFrequency: 'yearly',
        priority: 0.4,
      });
    }
  } catch (err) {
    console.error('[sitemap] dynamic route fetch failed — static routes only:', err);
  }

  return entries;
}
