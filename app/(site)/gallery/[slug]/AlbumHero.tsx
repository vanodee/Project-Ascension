import Image from 'next/image';
import type { GalleryAlbum } from '@/lib/types';
import { formatDate } from '@/lib/format';
import styles from './AlbumHero.module.scss';

interface AlbumHeroProps {
  album: GalleryAlbum;
}

export default function AlbumHero({ album }: AlbumHeroProps): React.JSX.Element {
  return (
    <div className={styles.hero}>
      <div className={styles.hero__photo}>
        <Image
          src={album.coverImage}
          alt=""
          fill
          sizes="(min-width: 1400px) 1400px, 100vw"
          className={styles['hero__photo-img']}
          priority
        />
      </div>
      <div className={styles.hero__scrim} aria-hidden="true" />

      <div className={styles.hero__badge}>
        <div
          className={styles['hero__badge-pill']}
          style={{ backgroundColor: album.society.color }}
        >
          <Image
            src={album.society.logo}
            alt=""
            fill
            sizes="140px"
            className={styles['hero__badge-img']}
          />
        </div>
      </div>

      <div className={styles.hero__content}>
        <p className={styles.hero__eyebrow}>{formatDate(album.eventDate)}</p>
        <h1 className={styles.hero__title}>{album.title}</h1>
      </div>

      <Image
        src="/icons/photo_icon.svg"
        alt=""
        width={46}
        height={34}
        className={styles.hero__icon}
      />
    </div>
  );
}
