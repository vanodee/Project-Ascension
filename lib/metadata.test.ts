import { describe, it, expect } from 'vitest';
import { buildPageMetadata, DEFAULT_OG_ALT, DEFAULT_OG_IMAGE, PARISH_NAME } from './metadata';

// Next merges `alternates` / `openGraph` / `twitter` wholesale parent→child, so
// every route must emit its own canonical + social block. These tests lock down
// the shape `buildPageMetadata` produces.

const base = { path: '/gallery', title: 'Gallery', description: 'Photos from parish life.' };

describe('buildPageMetadata', () => {
  it('emits a self-referential canonical and og:url', () => {
    const meta = buildPageMetadata(base);
    expect(meta.alternates?.canonical).toBe('/gallery');
    expect(meta.openGraph).toMatchObject({ url: '/gallery' });
  });

  it('leaves the page title to the layout template but suffixes social titles', () => {
    const meta = buildPageMetadata(base);
    expect(meta.title).toBe('Gallery');
    expect(meta.openGraph).toMatchObject({ title: `Gallery · ${PARISH_NAME}` });
    expect(meta.twitter).toMatchObject({ title: `Gallery · ${PARISH_NAME}` });
  });

  it('bypasses the title template and suffix when absoluteTitle is set', () => {
    const meta = buildPageMetadata({ ...base, path: '/', title: PARISH_NAME, absoluteTitle: true });
    expect(meta.title).toEqual({ absolute: PARISH_NAME });
    expect(meta.openGraph).toMatchObject({ title: PARISH_NAME });
    expect(meta.twitter).toMatchObject({ title: PARISH_NAME });
  });

  it('uses the default social card with its known dimensions', () => {
    const meta = buildPageMetadata(base);
    expect(meta.openGraph).toMatchObject({
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: DEFAULT_OG_ALT }],
      siteName: PARISH_NAME,
      locale: 'en_NG',
      type: 'website',
    });
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      images: [DEFAULT_OG_IMAGE],
    });
  });

  it('omits dimensions for a custom image, whose size is unknown', () => {
    const image = 'https://cdn.sanity.io/images/p3p9t4z1/production/abc-800x600.jpg';
    const meta = buildPageMetadata({ ...base, image, imageAlt: 'Harvest Mass', type: 'article' });
    expect(meta.openGraph).toMatchObject({
      images: [{ url: image, alt: 'Harvest Mass' }],
      type: 'article',
    });
    const [ogImage] = (meta.openGraph?.images ?? []) as Array<Record<string, unknown>>;
    expect(ogImage).not.toHaveProperty('width');
    expect(meta.twitter).toMatchObject({ images: [image] });
  });
});
