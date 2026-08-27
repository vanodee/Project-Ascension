import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import { getAlbums } from '@/lib/gallery';
import GalleryGrid from './GalleryGrid';
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

      <GalleryGrid albums={albums} />
    </div>
  );
}
