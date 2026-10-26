'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { dateBlockParts, formatDate } from '@/lib/format';
import {
  monthLabel,
  teachingExcerpt,
  type ArchiveMonth,
  type ArchiveYear,
  type FeaturedReflection,
} from '@/lib/faithArchive';
import type { FaithReflection } from '@/lib/types';
import ReflectionModal from './ReflectionModal';
import styles from './FaithBrowser.module.scss';

interface FaithBrowserProps {
  featured: FeaturedReflection | null;
  archive: ArchiveYear[];
  initialMonthKey: string | null;
  reflections: FaithReflection[];
}

const BASE_PATH = '/deepening-the-faith';

/** A "YYYY-MM-DD" Lagos date as an ISO instant at Lagos noon, for the lib/format helpers. */
function lagosNoon(date: string): string {
  return `${date}T12:00:00+01:00`;
}

function weekdayName(date: string): string {
  return new Date(lagosNoon(date)).toLocaleDateString('en-NG', {
    timeZone: 'Africa/Lagos',
    weekday: 'long',
  });
}

/** The month a year opens on: today's month if it has content there, else its latest. */
function defaultMonthFor(year: ArchiveYear | undefined): string | null {
  if (!year) return null;
  const enabled = year.months.filter((m) => m.enabled);
  return (enabled.find((m) => m.isCurrent) ?? enabled.at(-1))?.key ?? null;
}

export default function FaithBrowser({
  featured,
  archive,
  initialMonthKey,
  reflections,
}: FaithBrowserProps): React.JSX.Element {
  const [selectedYear, setSelectedYear] = useState<number>(
    initialMonthKey ? Number(initialMonthKey.slice(0, 4)) : (archive[0]?.year ?? 0),
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(initialMonthKey);
  const [yearOpen, setYearOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [open, setOpen] = useState<FaithReflection | null>(null);

  const themes = useMemo(
    () =>
      new Map(
        archive.flatMap((y) => y.months).map((m) => [m.key, m.theme] as const),
      ),
    [archive],
  );

  const year = archive.find((y) => y.year === selectedYear);
  const month: ArchiveMonth | undefined = year?.months.find((m) => m.key === selectedKey);

  const openReflection = (reflection: FaithReflection): void => {
    setOpen(reflection);
    window.history.pushState(null, '', `${BASE_PATH}?reflection=${reflection.slug}`);
  };

  const closeReflection = (): void => {
    setOpen(null);
    window.history.pushState(null, '', BASE_PATH);
  };

  // Auto-open when landing on a direct link (e.g. /deepening-the-faith?reflection=…),
  // and close the modal on browser back/forward.
  useEffect(() => {
    const applyFromLocation = (): void => {
      const slug = new URLSearchParams(window.location.search).get('reflection');
      const match = slug ? reflections.find((r) => r.slug === slug) : undefined;
      setOpen(match ?? null);
    };

    applyFromLocation();
    window.addEventListener('popstate', applyFromLocation);
    return () => window.removeEventListener('popstate', applyFromLocation);
  }, [reflections]);

  const changeYear = (value: number): void => {
    setSelectedYear(value);
    setSelectedKey(defaultMonthFor(archive.find((y) => y.year === value)));
  };

  const hasWriteUps = month?.rows.some((row) => row.reflection) ?? false;

  return (
    <>
      {featured ? (
        <FeaturedPanel featured={featured} onRead={() => openReflection(featured.reflection)} />
      ) : (
        <p className={styles.empty}>
          The first Deepening the Faith reflection will appear here on Sunday.
        </p>
      )}

      <section className={styles.archive} aria-labelledby="faith-archive-title">
        <header className={styles.archive__intro}>
          <div className={styles.archive__heading}>
            <p className={styles.archive__eyebrow}>The Deepening the Faith archive</p>
            <h2 id="faith-archive-title" className={styles.archive__title}>
              Choose a year. Return to a month.
            </h2>
          </div>
          {featured ? (
            <p className={styles.archive__note}>
              {featured.isThisWeek
                ? 'This week remains highlighted above'
                : 'The latest teaching remains highlighted above'}
            </p>
          ) : null}
        </header>

        <div className={styles.archive__layout}>
          <nav className={styles.navigator} aria-label="Archive by month">
            <label className={styles.navigator__field}>
              <span className={styles.navigator__label}>Browse by year</span>
              <span className={styles['navigator__select-wrap']}>
                <select
                  className={styles.navigator__select}
                  value={selectedYear}
                  onChange={(event) => changeYear(Number(event.target.value))}
                  onFocus={() => setYearOpen(true)}
                  onBlur={() => setYearOpen(false)}
                >
                  {archive.map((y) => (
                    <option key={y.year} value={y.year}>
                      {y.year}
                    </option>
                  ))}
                </select>
                <span
                  className={`${styles['navigator__select-chevron']} ${
                    yearOpen ? styles['navigator__select-chevron--open'] : ''
                  }`}
                  aria-hidden="true"
                />
              </span>
            </label>

            {/* Stacked layouts (below $bp-lg): the month list collapses to a dropdown. */}
            <label className={`${styles.navigator__field} ${styles['navigator__field--month']}`}>
              <span className={styles.navigator__label}>Month</span>
              <span className={styles['navigator__select-wrap']}>
                <select
                  className={styles.navigator__select}
                  value={selectedKey ?? ''}
                  onChange={(event) => setSelectedKey(event.target.value)}
                  onFocus={() => setMonthOpen(true)}
                  onBlur={() => setMonthOpen(false)}
                >
                  {selectedKey ? null : <option value="">No months yet</option>}
                  {year?.months.map((m) => (
                    <option key={m.key} value={m.key} disabled={!m.enabled}>
                      {m.name}
                      {m.isCurrent ? ' (this month)' : ''}
                    </option>
                  ))}
                </select>
                <span
                  className={`${styles['navigator__select-chevron']} ${
                    monthOpen ? styles['navigator__select-chevron--open'] : ''
                  }`}
                  aria-hidden="true"
                />
              </span>
            </label>

            <p className={`${styles.navigator__label} ${styles['navigator__months-label']}`}>
              Months in {selectedYear}
            </p>
            <ul className={styles.navigator__months}>
              {year?.months.map((m) => {
                const selected = m.key === selectedKey;
                return (
                  <li key={m.key}>
                    <button
                      type="button"
                      className={[
                        styles.navigator__month,
                        selected ? styles['navigator__month--selected'] : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      disabled={!m.enabled}
                      aria-pressed={selected}
                      aria-current={m.isCurrent ? 'date' : undefined}
                      onClick={() => setSelectedKey(m.key)}
                    >
                      {m.isCurrent ? (
                        <span className={styles.navigator__current} aria-hidden="true">
                          <span className={styles['navigator__current-dot']} />
                        </span>
                      ) : null}
                      {m.name}
                      {m.isCurrent ? (
                        <span className={styles['navigator__sr-only']}> (this month)</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {month ? (
            <div className={styles.month}>
              <div className={styles.month__card}>
                <p className={styles.month__label}>Selected archive month</p>
                <h3 className={styles.month__name}>{monthLabel(month.key)}</h3>
                <p className={styles.month__label}>Theme for the month</p>
                <p className={styles.month__theme}>{month.theme ?? 'Monthly theme to be added'}</p>
              </div>

              <div className={styles.month__heading}>
                <h3 className={styles['month__heading-title']}>The Sundays of {month.name}</h3>
                <p className={styles['month__heading-note']}>
                  {hasWriteUps ? 'Choose a write-up to read' : 'Write-ups appear here as they are added'}
                </p>
              </div>

              <ol className={styles.sundays}>
                {month.rows.map((row) => (
                  <li key={row.date} className={styles.sunday}>
                    <SundayRow
                      date={row.date}
                      reflection={row.reflection}
                      onOpen={openReflection}
                    />
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className={styles.empty}>No months have been added to the archive yet.</p>
          )}
        </div>
      </section>

      {open ? (
        <ReflectionModal
          reflection={open}
          theme={themes.get(open.monthKey) ?? null}
          onClose={closeReflection}
        />
      ) : null}
    </>
  );
}

function FeaturedPanel({
  featured,
  onRead,
}: {
  featured: FeaturedReflection;
  onRead: () => void;
}): React.JSX.Element {
  const { reflection, theme, isThisWeek } = featured;
  const refs = reflection.biblicalReferences;

  return (
    <section className={styles.featured} aria-labelledby="faith-featured-title">
      <div className={styles.featured__theme}>
        <div className={styles['featured__theme-context']}>
          <p className={styles['featured__theme-month']}>{monthLabel(reflection.monthKey)}</p>
          <p className={styles['featured__theme-caption']}>Theme for the month</p>
        </div>
        <h2 className={styles['featured__theme-title']}>{theme ?? 'Monthly theme to be added'}</h2>
      </div>

      <div className={styles.featured__body}>
        <Image
          src="/icons/deepening-the-faith.svg"
          alt=""
          width={309}
          height={300}
          className={styles.featured__logo}
        />

        <div className={styles.featured__preview}>
          <div className={styles.featured__status}>
            <p className={styles.featured__badge}>{isThisWeek ? 'This week' : 'Latest'}</p>
            <p className={styles.featured__date}>
              {weekdayName(reflection.date)} {formatDate(lagosNoon(reflection.date))}
            </p>
          </div>

          <article className={styles.featured__card}>
            {refs.length > 0 ? (
              <p className={styles['featured__card-refs']}>
                {refs.length > 1 ? 'BIBLICAL REFERENCES' : 'BIBLICAL REFERENCE'} · {refs.join('; ')}
              </p>
            ) : null}
            <h3 id="faith-featured-title" className={styles['featured__card-title']}>
              {reflection.topic}
            </h3>
            <p className={styles['featured__card-excerpt']}>
              {teachingExcerpt(reflection.teaching)}
            </p>
          </article>

          <div className={styles.featured__actions}>
            <p className={styles.featured__contents}>Scripture · Reflection · Teaching · Task</p>
            <Button size="sm" onClick={onRead}>
              Read more →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SundayRow({
  date,
  reflection,
  onOpen,
}: {
  date: string;
  reflection: FaithReflection | null;
  onOpen: (reflection: FaithReflection) => void;
}): React.JSX.Element {
  const block = dateBlockParts(lagosNoon(date));
  const content = (
    <>
      <span className={styles.sunday__date} aria-hidden="true">
        <span className={styles['sunday__date-weekday']}>{block.weekday}</span>
        <span className={styles['sunday__date-day']}>{block.day}</span>
        <span className={styles['sunday__date-month']}>{block.month}</span>
      </span>
      <span className={styles['sunday__sr-only']}>
        {weekdayName(date)} {formatDate(lagosNoon(date))}:{' '}
      </span>
      <span
        className={`${styles.sunday__topic} ${reflection ? '' : styles['sunday__topic--pending']}`}
      >
        {reflection?.topic ?? 'Weekly topic to be added'}
      </span>
      <span className={styles.sunday__status}>{reflection ? 'Read →' : 'Awaiting write-up'}</span>
    </>
  );

  return reflection ? (
    <button
      type="button"
      className={`${styles.sunday__entry} ${styles['sunday__entry--link']}`}
      onClick={() => onOpen(reflection)}
    >
      {content}
    </button>
  ) : (
    <div className={styles.sunday__entry}>{content}</div>
  );
}
