'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Homily } from '@/lib/types';
import { formatDate } from '@/lib/format';
import styles from './HomilyArchive.module.scss';

interface HomilyArchiveProps {
  homilies: Homily[];
}

const ALL = 'All';

/** Filterable homily archive — filter by priest and liturgical season. */
export default function HomilyArchive({ homilies }: HomilyArchiveProps): React.JSX.Element {
  const [priestFilter, setPriestFilter] = useState<string>(ALL);
  const [seasonFilter, setSeasonFilter] = useState<string>(ALL);
  const [priestOpen, setPriestOpen] = useState(false);
  const [seasonOpen, setSeasonOpen] = useState(false);

  const priests = useMemo(
    () => [ALL, ...new Set(homilies.map((h) => h.authorName))],
    [homilies],
  );
  const seasons = useMemo(
    () => [ALL, ...new Set(homilies.map((h) => h.liturgicalSeason))],
    [homilies],
  );

  const filtered = homilies.filter(
    (homily) =>
      (priestFilter === ALL || homily.authorName === priestFilter) &&
      (seasonFilter === ALL || homily.liturgicalSeason === seasonFilter),
  );

  return (
    <div className={styles.archive}>
      <div className={styles.archive__filters}>
        <label className={styles.archive__filter}>
          <span className={styles['archive__filter-label']}>Priest</span>
          <span className={styles['archive__select-wrap']}>
            <select
              value={priestFilter}
              onChange={(event) => setPriestFilter(event.target.value)}
              onFocus={() => setPriestOpen(true)}
              onBlur={() => setPriestOpen(false)}
              className={styles['archive__filter-select']}
            >
              {priests.map((priest) => (
                <option key={priest} value={priest}>
                  {priest}
                </option>
              ))}
            </select>
            <span
              className={`${styles['archive__select-chevron']} ${
                priestOpen ? styles['archive__select-chevron--open'] : ''
              }`}
              aria-hidden="true"
            />
          </span>
        </label>
        <label className={styles.archive__filter}>
          <span className={styles['archive__filter-label']}>Season</span>
          <span className={styles['archive__select-wrap']}>
            <select
              value={seasonFilter}
              onChange={(event) => setSeasonFilter(event.target.value)}
              onFocus={() => setSeasonOpen(true)}
              onBlur={() => setSeasonOpen(false)}
              className={styles['archive__filter-select']}
            >
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
            <span
              className={`${styles['archive__select-chevron']} ${
                seasonOpen ? styles['archive__select-chevron--open'] : ''
              }`}
              aria-hidden="true"
            />
          </span>
        </label>
      </div>

      <div className={styles.archive__list}>
        {filtered.map((homily) => (
          <Link
            key={homily.slug}
            href={`/homilies/${homily.slug}`}
            className={styles.archive__item}
          >
            <span className={styles['archive__item-main']}>
              <span className={styles['archive__item-meta']}>
                {formatDate(homily.publishedAt)} • {homily.liturgicalSeason}
              </span>
              <span className={styles['archive__item-title']}>{homily.title}</span>
              <span className={styles['archive__item-author']}>
                {homily.authorName} — {homily.scriptureReference}
              </span>
            </span>
            <span className={styles['archive__item-duration']}>
              ► {homily.audioDuration}
            </span>
          </Link>
        ))}
        {filtered.length === 0 ? (
          <p className={styles.archive__empty}>
            No homilies match the selected filters.
          </p>
        ) : null}
      </div>
    </div>
  );
}
