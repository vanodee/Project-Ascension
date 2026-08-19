'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ClergyMember, ClergyRole } from '@/lib/types';
import styles from './ClergyGrid.module.scss';

interface ClergyGridProps {
  members: ClergyMember[];
}

type Filter = 'all' | ClergyRole;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'priest', label: 'Priests' },
  { value: 'reverend_sister', label: 'Reverend Sisters' },
  { value: 'catechist', label: 'Catechists' },
];

const ROLE_LABELS: Record<ClergyRole, string> = {
  priest: 'Priest',
  reverend_sister: 'Reverend Sister',
  catechist: 'Catechist',
};

/** Filterable clergy grid — All / Priests / Reverend Sisters / Catechists. */
export default function ClergyGrid({ members }: ClergyGridProps): React.JSX.Element {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = members.filter(
    (member) => filter === 'all' || member.role === filter,
  );

  return (
    <div className={styles.grid}>
      <div className={styles.grid__filters} role="group" aria-label="Filter clergy by role">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles['grid__filter']} ${
              filter === option.value ? styles['grid__filter--active'] : ''
            }`}
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className={styles.grid__cards}>
        {visible.map((member) => (
          <article key={member.slug} className={styles.grid__card}>
            <div className={styles['grid__avatar-frame']}>
              <Image
                src={member.photo}
                alt={`Portrait of ${member.name}`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 480px) 50vw, 100vw"
                className={styles.grid__photo}
              />
            </div>
            <div className={styles.grid__info}>
              <h2 className={styles.grid__name}>{member.name}</h2>
              <p className={styles.grid__role}>
                {member.order === 1 && member.role === 'priest'
                  ? 'Parish Priest'
                  : ROLE_LABELS[member.role]}
              </p>
              <p className={styles.grid__bio}>{member.bio}</p>
              <p className={styles.grid__contact}>
                <a href={`mailto:${member.email}`} className={styles['grid__contact-link']}>
                  {member.email}
                </a>
                {member.phone ? (
                  <>
                    <br />
                    <a
                      href={`tel:${member.phone.replace(/\s/g, '')}`}
                      className={styles['grid__contact-link']}
                    >
                      {member.phone}
                    </a>
                  </>
                ) : null}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
