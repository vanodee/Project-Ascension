import type { Metadata } from 'next';

// Single source of per-page metadata. Every route's `metadata` / `generateMetadata`
// goes through `buildPageMetadata` so that each page emits its OWN canonical URL
// and its OWN Open Graph / Twitter title + url — Next merges these blocks
// wholesale from parent to child, so a route that sets only `title` would
// otherwise inherit the root layout's canonical ('/') and OG title verbatim.

/** Canonical display name. Also stored in `siteSettings`; it does not change. */
export const PARISH_NAME = 'Catholic Church of the Ascension';

/** Stable path (in `public/`) to the 1200×630 site-wide social card. */
export const DEFAULT_OG_IMAGE = '/opengraph-image.png';
export const DEFAULT_OG_ALT =
  'The Catholic Church of the Ascension — MMIA, Ikeja, Lagos';

interface PageMetadataInput {
  /** Root-relative route path — no trailing slash except for "/". Becomes the canonical URL and og:url. */
  path: string;
  /** Page title. The root layout's "%s | Parish" template wraps it unless `absoluteTitle` is set. */
  title: string;
  description: string;
  /** Home page only — emit the title verbatim, bypassing the title template. */
  absoluteTitle?: boolean;
  /** Absolute or root-relative image URL. Defaults to the site-wide social card. */
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
}

export function buildPageMetadata({
  path,
  title,
  description,
  absoluteTitle = false,
  image = DEFAULT_OG_IMAGE,
  imageAlt = DEFAULT_OG_ALT,
  type = 'website',
}: PageMetadataInput): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} · ${PARISH_NAME}`;
  const ogImage =
    image === DEFAULT_OG_IMAGE
      ? { url: image, width: 1200, height: 630, alt: imageAlt }
      : { url: image, alt: imageAlt };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: PARISH_NAME,
      locale: 'en_NG',
      type,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [ogImage.url],
    },
  };
}
