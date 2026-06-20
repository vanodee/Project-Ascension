import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Button from '@/components/ui/Button';
import { getAlbums, getAlbum } from '@/lib/gallery';
import { formatDate } from '@/lib/format';
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
  return {
    title: `${album.title} — Gallery`,
    description: album.description,
  };
}

export default async function AlbumPage({
  params,
}: AlbumRouteParams): Promise<React.JSX.Element> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) notFound();

  return (
    <div className={styles.album}>
      <header className={styles.album__header}>
        <p className={styles.album__meta}>
          {formatDate(album.eventDate)} • {album.category}
        </p>
        <h1 className={styles.album__title}>{album.title}</h1>
        <p className={styles.album__description}>{album.description}</p>
      </header>

      <AlbumLightbox media={album.media} />

      <footer className={styles.album__footer}>
        <Button href="/gallery" variant="outline" size="sm">
          ← All Albums
        </Button>
      </footer>
    </div>
  );
}
