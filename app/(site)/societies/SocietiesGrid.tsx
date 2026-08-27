'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SOCIETY_TYPE_ORDER } from '@/lib/societies';
import type { Society, SocietyType } from '@/lib/types';
import styles from './SocietiesGrid.module.scss';

interface SocietiesGridProps {
  societies: Society[];
}

type Filter = 'all' | SocietyType;

const TYPE_LABELS: Record<SocietyType, string> = {
  parish_zone: 'Parish Zone',
  demographic_organization: 'Demographic',
  pious_devotional: 'Pious/Devotional',
  charismatic_movement: 'Charismatic',
  knightly_professional: 'Knightly/Professional',
  liturgical_ministry: 'Liturgical',
  general: 'General',
};

export default function SocietiesGrid({ societies }: SocietiesGridProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const availableTypes = useMemo(
    () =>
      SOCIETY_TYPE_ORDER.filter((type) =>
        societies.some((society) => society.societyType === type),
      ),
    [societies],
  );

  const visible = societies.filter((society) => {
    const matchesFilter = filter === 'all' || society.societyType === filter;
    const matchesQuery = society.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
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
        <span className={styles['grid__search-label']}>Search societies</span>
        <input
          type="text"
          className={styles['grid__search-input']}
          placeholder="Search societies..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className={styles.grid__filters} role="group" aria-label="Filter societies by type">
        <button
          type="button"
          className={`${styles['grid__filter']} ${
            filter === 'all' ? styles['grid__filter--active'] : ''
          }`}
          aria-pressed={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {availableTypes.map((type) => (
          <button
            key={type}
            type="button"
            className={`${styles['grid__filter']} ${
              filter === type ? styles['grid__filter--active'] : ''
            }`}
            aria-pressed={filter === type}
            onClick={() => setFilter(type)}
          >
            {TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <div className={styles.grid__cards}>
          {visible.map((society) => (
            <Link
              key={society.slug}
              href={`/societies/${society.slug}`}
              className={styles.card}
              style={{ backgroundColor: society.color }}
            >
              <div className={styles.card__logo}>
                <Image
                  src={society.logo}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 480px) 50vw, 100vw"
                  className={styles['card__logo-img']}
                />
              </div>
              <div className={styles.card__overlay}>
                <span className={styles.card__badge}>{TYPE_LABELS[society.societyType]}</span>
                <h2 className={styles.card__name}>{society.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.grid__empty}>No societies match your search.</p>
      )}
    </div>
  );
}
