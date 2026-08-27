'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import type { Announcement } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { toPlainText } from '@/lib/portableText';
import AnnouncementModal from '@/components/announcements/AnnouncementModal';
import styles from './AnnouncementsGrid.module.scss';

interface AnnouncementsGridProps {
  announcements: Announcement[];
}

const ALL_SOCIETIES = 'all';

function searchableText(announcement: Announcement): string {
  return [
    announcement.title,
    announcement.excerpt,
    announcement.eventLocation ?? '',
    toPlainText(announcement.body),
  ]
    .join(' ')
    .toLowerCase();
}

export default function AnnouncementsGrid({
  announcements,
}: AnnouncementsGridProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [societyFilter, setSocietyFilter] = useState(ALL_SOCIETIES);
  const [societyOpen, setSocietyOpen] = useState(false);
  const [selected, setSelected] = useState<Announcement | null>(null);

  const openAnnouncement = (announcement: Announcement): void => {
    setSelected(announcement);
    window.history.pushState(null, '', `/announcements?slug=${announcement.slug}`);
  };

  const closeAnnouncement = (): void => {
    setSelected(null);
    window.history.pushState(null, '', '/announcements');
  };

  // Auto-open when landing on a direct link (e.g. /announcements?slug=…),
  // and close the modal on browser back/forward.
  useEffect(() => {
    const applyFromLocation = (): void => {
      const slug = new URLSearchParams(window.location.search).get('slug');
      const match = slug ? announcements.find((a) => a.slug === slug) : undefined;
      setSelected(match ?? null);
    };

    applyFromLocation();
    window.addEventListener('popstate', applyFromLocation);
    return () => window.removeEventListener('popstate', applyFromLocation);
  }, [announcements]);

  const societies = useMemo(() => {
    const bySlug = new Map(
      announcements.map((announcement) => [announcement.society.slug, announcement.society.name]),
    );
    return Array.from(bySlug, ([slug, name]) => ({ slug, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [announcements]);

  const visible = announcements.filter((announcement) => {
    const matchesQuery = searchableText(announcement).includes(query.trim().toLowerCase());
    const matchesSociety =
      societyFilter === ALL_SOCIETIES || announcement.society.slug === societyFilter;
    return matchesQuery && matchesSociety;
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
        <span className={styles['grid__search-label']}>Search announcements</span>
        <input
          type="text"
          className={styles['grid__search-input']}
          placeholder="Search announcements..."
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
      </div>

      {visible.length > 0 ? (
        <div className={styles.grid__cards}>
          {visible.map((announcement) => (
            <button
              key={announcement.slug}
              type="button"
              onClick={() => openAnnouncement(announcement)}
              className={styles.card}
            >
              <div className={styles.card__media}>
                {announcement.image ? (
                  <Image
                    src={announcement.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className={styles.card__photo}
                  />
                ) : (
                  <div
                    className={styles['card__fallback']}
                    style={{
                      background: `linear-gradient(to bottom, ${announcement.society.color}, transparent)`
                    }}
                  >
                    <Image
                      src="/images/Announcement Default.png"
                      alt=""
                      width={408}
                      height={230}
                      className={styles['card__fallback-icon']}
                    />
                  </div>
                )}
                <div
                  className={styles.card__logo}
                  style={{ borderColor: announcement.society.color }}
                >
                  <Image
                    src={announcement.society.logo}
                    alt=""
                    fill
                    sizes="60px"
                    className={styles['card__logo-img']}
                  />
                </div>
                {announcement.pinned ? (
                  <span className={styles.card__pinned}>Pinned</span>
                ) : null}
              </div>
              <div className={styles.card__body}>
                <h2 className={styles.card__title}>{announcement.title}</h2>
                <p className={styles.card__date}>{formatDate(announcement.publishedAt)}</p>
                <p className={styles.card__excerpt}>{announcement.excerpt}</p>
              </div>

              <span
                className={styles.card__tag}
                style={{ backgroundColor: announcement.society.color }}
              >
                {announcement.society.shortName}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.grid__empty}>No announcements match your search and filters.</p>
      )}

      {selected ? (
        <AnnouncementModal announcement={selected} onClose={closeAnnouncement} />
      ) : null}
    </div>
  );
}
