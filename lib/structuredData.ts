import { SITE_URL } from './siteUrl';
import type { SiteSettings } from './types';

// schema.org JSON-LD builders. Rendered by <JsonLd> (components/seo/JsonLd.tsx).
// Nodes are cross-referenced by a stable `@id` so the graph stays connected:
//   #parish   — the Church / place of worship (identity, address, geo, socials)
//   #website  — the site itself, published by #parish

const PARISH_ID = `${SITE_URL}/#parish`;
const WEBSITE_ID = `${SITE_URL}/#website`;

type JsonLdNode = Record<string, unknown>;

function youtubeUrl(channelId: string): string | null {
  return channelId ? `https://www.youtube.com/channel/${channelId}` : null;
}

/** `Church` / `PlaceOfWorship` — the parish's core identity node. Rendered site-wide. */
export function parishOrganizationLd(s: SiteSettings): JsonLdNode {
  const sameAs = [s.facebookUrl, s.instagramUrl, youtubeUrl(s.youtubeChannelId)].filter(
    (v): v is string => Boolean(v),
  );

  return {
    '@context': 'https://schema.org',
    '@type': ['Church', 'PlaceOfWorship'],
    '@id': PARISH_ID,
    name: s.parishName,
    ...(s.shortName ? { alternateName: s.shortName } : {}),
    url: SITE_URL,
    ...(s.logo ? { logo: s.logo } : {}),
    image: `${SITE_URL}/opengraph-image.png`,
    ...(s.phone ? { telephone: s.phone } : {}),
    ...(s.email ? { email: s.email } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(s.streetAddress ? { streetAddress: s.streetAddress } : {}),
      ...(s.addressLocality ? { addressLocality: s.addressLocality } : {}),
      ...(s.addressRegion ? { addressRegion: s.addressRegion } : {}),
      ...(s.postalCode ? { postalCode: s.postalCode } : {}),
      addressCountry: s.addressCountry || 'NG',
    },
    ...(typeof s.latitude === 'number' && typeof s.longitude === 'number'
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: s.latitude,
            longitude: s.longitude,
          },
        }
      : {}),
    ...(s.foundingYear ? { foundingDate: s.foundingYear } : {}),
    ...(s.diocese
      ? { parentOrganization: { '@type': 'Organization', name: s.diocese } }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** `WebSite` — the site, published by the parish. Rendered site-wide. */
export function webSiteLd(s: SiteSettings): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: s.parishName,
    ...(s.shortName ? { alternateName: s.shortName } : {}),
    inLanguage: 'en-NG',
    publisher: { '@id': PARISH_ID },
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Root-relative path, e.g. "/gallery" or "/gallery/harvest-2025". */
  path: string;
}

/** `BreadcrumbList` for a nested detail page. Pass the trail from home to the current page. */
export function breadcrumbLd(items: BreadcrumbItem[]): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** `ContactPage` node for /contact, tied back to the parish identity. */
export function contactPageLd(): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE_URL}/contact#webpage`,
    url: `${SITE_URL}/contact`,
    name: 'Contact Us',
    about: { '@id': PARISH_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };
}
