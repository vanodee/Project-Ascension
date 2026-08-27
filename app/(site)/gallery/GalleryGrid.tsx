'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { GalleryAlbum } from '@/lib/types';
import { formatDate } from '@/lib/format';
import styles from './GalleryGrid.module.scss';

interface GalleryGridProps {
  albums: GalleryAlbum[];
}

const ALL_SOCIETIES = 'all';

function searchableText(album: GalleryAlbum): string {
  return [
    album.title,
    album.description,
    ...album.media.map((item) => `${item.caption} ${item.altText}`),
  ]
    .join(' ')
    .toLowerCase();
}

export default function GalleryGrid({ albums }: GalleryGridProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [societyFilter, setSocietyFilter] = useState(ALL_SOCIETIES);
  const [societyOpen, setSocietyOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const societies = useMemo(() => {
    const bySlug = new Map(albums.map((album) => [album.society.slug, album.society.name]));
    return Array.from(bySlug, ([slug, name]) => ({ slug, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [albums]);

  const visible = albums.filter((album) => {
    const matchesQuery = searchableText(album).includes(query.trim().toLowerCase());
    const matchesSociety = societyFilter === ALL_SOCIETIES || album.society.slug === societyFilter;
    const matchesDateFrom = !dateFrom || album.eventDate >= dateFrom;
    const matchesDateTo = !dateTo || album.eventDate <= dateTo;
    return matchesQuery && matchesSociety && matchesDateFrom && matchesDateTo;
  });

  return (
    <div className={styles.grid}>
      <label className={styles.grid__search}>
        <svg
          className={styles['grid__search-icon']}
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="14" y1="14" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className={styles['grid__search-label']}>Search albums</span>
        <input
          type="text"
          className={styles['grid__search-input']}
          placeholder="Search albums..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className={styles.grid__filters}>
        <label className={styles.grid__filter}>
          <span className={styles['grid__filter-label']}>Society</span>
          <span className={styles['grid__select-wrap']}>
            <select
              className={styles['grid__filter-select']}
              value={societyFilter}
              onChange={(event) => setSocietyFilter(event.target.value)}
              onFocus={() => setSocietyOpen(true)}
              onBlur={() => setSocietyOpen(false)}
            >
              <option value={ALL_SOCIETIES}>All Societies</option>
              {societies.map((society) => (
                <option key={society.slug} value={society.slug}>
                  {society.name}
                </option>
              ))}
            </select>
            <span
              className={`${styles['grid__select-chevron']} ${
                societyOpen ? styles['grid__select-chevron--open'] : ''
              }`}
              aria-hidden="true"
            />
          </span>
        </label>

        <label className={styles.grid__filter}>
          <span className={styles['grid__filter-label']}>From</span>
          <input
            type="date"
            className={styles['grid__filter-date']}
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(event) => setDateFrom(event.target.value)}
          />
        </label>

        <label className={styles.grid__filter}>
          <span className={styles['grid__filter-label']}>To</span>
          <input
            type="date"
            className={styles['grid__filter-date']}
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(event) => setDateTo(event.target.value)}
          />
        </label>
      </div>

      {visible.length > 0 ? (
        <div className={styles.grid__cards}>
          {visible.map((album) => (
            <Link key={album.slug} href={`/gallery/${album.slug}`} className={styles.card}>
              <div
                className={styles.card__logo}
                style={{ 
                  backgroundColor: album.society.color 
                }}
              >
                <Image
                  src={album.society.logo}
                  alt=""
                  fill
                  sizes="60px"
                  className={styles['card__logo-img']}
                />
              </div>

              <div className={styles.card__inner}>
                <div className={styles.card__media}>
                  <div className={styles['card__photo-frame']}>
                    <Image
                      src={album.coverImage}
                      alt={album.description}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className={styles.card__photo}
                    />
                  </div>

                </div>
                <div className={styles.card__body}>
                  <p className={styles.card__date}>{formatDate(album.eventDate)}</p>
                  <h2 className={styles.card__title}>{album.title}</h2>
                  <p className={styles.card__description}>{album.description}</p>
                </div>
              </div>
              <div
                className={styles.card__stripe}
                style={{ backgroundColor: album.society.color }}
              />
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.grid__empty}>No albums match your search and filters.</p>
      )}
    </div>
  );
}
