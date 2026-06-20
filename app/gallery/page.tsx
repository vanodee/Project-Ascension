import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import { getAlbums } from '@/lib/gallery';
import { formatDate } from '@/lib/format';
import styles from './page.module.scss';

// ISR — revalidate every 10 minutes.
export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Photos and videos from the life of the Catholic Church of the Ascension, Ikeja, Lagos — liturgies, celebrations, and outreach.',
};

export default async function GalleryPage(): Promise<React.JSX.Element> {
  const albums = await getAlbums();

  return (
    <div className={styles.gallery}>
      <PageHeader
        eyebrow="Parish Life"
        title="Gallery"
        description="Moments from the life of our parish — worship, celebration, and service."
      />

      <div className={styles.gallery__grid}>
        {albums.map((album) => (
          <Link
            key={album.slug}
            href={`/gallery/${album.slug}`}
            className={styles.gallery__card}
          >
            <span className={styles['gallery__card-image']}>
              <Image
                src={album.coverImage}
                alt={album.description}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className={styles['gallery__card-photo']}
              />
            </span>
            <span className={styles['gallery__card-body']}>
              <span className={styles['gallery__card-meta']}>
                {formatDate(album.eventDate)} • {album.category}
              </span>
              <span className={styles['gallery__card-title']}>{album.title}</span>
              <span className={styles['gallery__card-description']}>
                {album.description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
