import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Button from '@/components/ui/Button';
import JsonLd from '@/components/seo/JsonLd';
import { getAlbums, getAlbum } from '@/lib/gallery';
import { buildPageMetadata } from '@/lib/metadata';
import { breadcrumbLd } from '@/lib/structuredData';
import AlbumHero from './AlbumHero';
import AlbumLightbox from './AlbumLightbox';
import styles from './page.module.scss';

// ISR — revalidate every 10 minutes.
export const revalidate = 600;

interface AlbumRouteParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const albums = await getAlbums();
  return albums.map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({ params }: AlbumRouteParams): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) return {};
  return buildPageMetadata({
    path: `/gallery/${slug}`,
    title: `${album.title} — Gallery`,
    description: album.description,
    image: album.coverImage,
    imageAlt: album.title,
  });
}

export default async function AlbumPage({
  params,
}: AlbumRouteParams): Promise<React.JSX.Element> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) notFound();

  return (
    <div className={styles.album}>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Gallery', path: '/gallery' },
          { name: album.title, path: `/gallery/${slug}` },
        ])}
      />
      <AlbumHero album={album} />

      <div className={styles.album__content}>
        <p className={styles.album__description}>{album.description}</p>

        <AlbumLightbox media={album.media} />

        <footer className={styles.album__footer}>
          <Button href="/gallery" variant="outline" size="sm">
            ← All Albums
          </Button>
        </footer>

        <div className={styles.album__watermark}>
          <Image src="/icons/ascension_logo_dark.svg" alt="" width={72} height={74} />
        </div>
      </div>
    </div>
  );
}
