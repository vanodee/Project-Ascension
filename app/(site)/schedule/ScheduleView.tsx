'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { CalendarEvent, CalendarEventType } from '@/lib/types';
import { eventTypeLabel, expandEvents, monthBounds, type ScheduleData } from '@/lib/calendar';
import { formatDate, formatTime } from '@/lib/format';
import ScheduleOverlay from './ScheduleOverlay';
import styles from './ScheduleView.module.scss';

interface ScheduleViewProps {
  data: ScheduleData;
  /** Today in Lagos, "YYYY-MM-DD" — computed server-side and passed in for a deterministic render. */
  today: string;
}

type TypeFilter = 'all' | CalendarEventType;
type ViewMode = 'list' | 'month';

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All events' },
  { value: 'mass', label: 'Masses' },
  { value: 'confession', label: 'Confessions' },
  { value: 'parish_event', label: 'Parish Events' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'celebration', label: 'Celebrations' },
];

const TYPE_CLASS: Record<CalendarEventType, string> = {
  mass: styles['schedule__badge--mass'] ?? '',
  confession: styles['schedule__badge--confession'] ?? '',
  parish_event: styles['schedule__badge--parish-event'] ?? '',
  meeting: styles['schedule__badge--meeting'] ?? '',
  celebration: styles['schedule__badge--celebration'] ?? '',
};

const DOT_CLASS: Record<CalendarEventType, string> = {
  mass: styles['schedule__dot--mass'] ?? '',
  confession: styles['schedule__dot--confession'] ?? '',
  parish_event: styles['schedule__dot--parish-event'] ?? '',
  meeting: styles['schedule__dot--meeting'] ?? '',
  celebration: styles['schedule__dot--celebration'] ?? '',
};

// First letter of the event category, shown inside the dots on desktop.
// Mass and Meeting both read "M" — the colour disambiguates.
const TYPE_LETTER: Record<CalendarEventType, string> = {
  mass: 'M',
  confession: 'C',
  parish_event: 'P',
  meeting: 'M',
  celebration: 'S',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * Parish schedule with month and list views, filterable by event type. Both views
 * are scoped to one month; the month nav under the toolbar moves between them.
 * Recurring events are expanded on the client so every month is populated.
 */
export default function ScheduleView({ data, today }: ScheduleViewProps): React.JSX.Element {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const monthEvents = useMemo(
    () => expandEvents(data, monthBounds(monthOffset, today)),
    [data, monthOffset, today],
  );

  const filtered = useMemo(
    () => monthEvents.filter((event) => typeFilter === 'all' || event.type === typeFilter),
    [monthEvents, typeFilter],
  );

  const byDate = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();
    for (const event of filtered) {
      const list = groups.get(event.date) ?? [];
      list.push(event);
      groups.set(event.date, list);
    }
    return groups;
  }, [filtered]);

  const groupedByDay = useMemo(() => [...byDate.entries()], [byDate]);

  // List view is today-forward: past days drop off as the day turns over.
  const visibleDays = useMemo(
    () => groupedByDay.filter(([key]) => key >= today),
    [groupedByDay, today],
  );

  const monthGrid = useMemo(() => {
    const { from } = monthBounds(monthOffset, today);
    const first = new Date(`${from}T12:00:00Z`);
    const year = first.getUTCFullYear();
    const month = first.getUTCMonth();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0, 12)).getUTCDate();
    const leadingBlanks = first.getUTCDay();

    const cells: { key: string | null; day: number }[] = [];
    for (let i = 0; i < leadingBlanks; i += 1) cells.push({ key: null, day: 0 });
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push({ key: `${year}-${pad(month + 1)}-${pad(d)}`, day: d });
    }

    return {
      cells,
      monthLabel: first.toLocaleDateString('en-NG', {
        timeZone: 'UTC',
        month: 'long',
        year: 'numeric',
      }),
    };
  }, [monthOffset, today]);

  const selectedDayEvents = selectedDay ? byDate.get(selectedDay) ?? [] : [];

  // The "when" of an event: a relative event reads "After Weekday Mass" rather
  // than the clock time it happens to resolve to.
  const whenText = (event: CalendarEvent): string => {
    if (event.allDay) return 'All day';
    if (event.relativeTo) return event.relativeTo;
    return event.end
      ? `${formatTime(event.start)} – ${formatTime(event.end)}`
      : formatTime(event.start);
  };

  /**
   * Detail body shared by the list-view event modal and the month-view day
   * accordion. `compact` (the accordion) drops the date/time line — the day
   * modal already shows the date in its heading and the time in each row — and
   * shows only the location, with an icon.
   */
  const renderDetail = (event: CalendarEvent, compact = false): React.JSX.Element => (
    <>
      {!compact ? (
        <p className={styles['schedule__modal-meta']}>
          <Image
            src="/icons/calendar.svg"
            alt=""
            width={20}
            height={20}
            className={styles['schedule__modal-meta-icon']}
          />
          <span>
            {formatDate(event.start)} • {whenText(event)}
          </span>
        </p>
      ) : null}
      {event.location ? (
        <p className={styles['schedule__modal-meta']}>
          <Image
            src="/icons/location.svg"
            alt=""
            width={20}
            height={20}
            className={styles['schedule__modal-meta-icon']}
          />
          <span>{event.location}</span>
        </p>
      ) : null}
      {event.description ? (
        <p className={styles['schedule__modal-description']}>{event.description}</p>
      ) : null}
      {event.note ? <p className={styles['schedule__modal-note']}>{event.note}</p> : null}
    </>
  );

  return (
    <div className={styles.schedule}>
      <div className={styles.schedule__toolbar}>
        <label className={styles['schedule__filter-field']}>
          <span className={styles['schedule__filter-label']}>Event type</span>
          <span className={styles['schedule__select-wrap']}>
            <select
              className={styles['schedule__select']}
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
              onFocus={() => setFilterOpen(true)}
              onBlur={() => setFilterOpen(false)}
            >
              {TYPE_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span
              className={`${styles['schedule__select-chevron']} ${
                filterOpen ? styles['schedule__select-chevron--open'] : ''
              }`}
              aria-hidden="true"
            />
          </span>
        </label>
        <div className={styles['schedule__view-toggle']} role="group" aria-label="Calendar view">
          {(['month', 'list'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`${styles['schedule__view-btn']} ${
                viewMode === mode ? styles['schedule__view-btn--active'] : ''
              }`}
              aria-pressed={viewMode === mode}
              onClick={() => setViewMode(mode)}
            >
              {mode === 'list' ? 'List' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles['schedule__month-nav']}>
        <button
          type="button"
          className={styles['schedule__month-arrow']}
          aria-label="Previous month"
          onClick={() => setMonthOffset((offset) => offset - 1)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <polyline
              points="15 6 9 12 15 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h2 className={styles['schedule__month-label']}>{monthGrid.monthLabel}</h2>
        <button
          type="button"
          className={styles['schedule__month-arrow']}
          aria-label="Next month"
          onClick={() => setMonthOffset((offset) => offset + 1)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <polyline
              points="9 6 15 12 9 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {viewMode === 'month' ? (
        <div className={styles.schedule__month}>
          <div className={styles['schedule__month-weekdays']}>
            {WEEKDAYS.map((day) => (
              <span key={day} className={styles['schedule__month-weekday']}>
                {day}
              </span>
            ))}
          </div>

          <div className={styles['schedule__month-grid']}>
            {monthGrid.cells.map((cell, index) => {
              if (!cell.key) {
                return (
                  <div
                    key={`blank-${index}`}
                    className={`${styles['schedule__month-cell']} ${styles['schedule__month-cell--blank']}`}
                  />
                );
              }

              const dayEvents = byDate.get(cell.key) ?? [];
              const isToday = cell.key === today;
              const cellClass = `${styles['schedule__month-cell']} ${
                isToday ? styles['schedule__month-cell--today'] : ''
              }`;

              const inner = (
                <>
                  <span className={styles['schedule__month-day']}>{cell.day}</span>
                  {dayEvents.length > 0 ? (
                    <span className={styles['schedule__month-dots']}>
                      {dayEvents.map((event) => (
                        <span
                          key={event.id}
                          className={`${styles['schedule__dot']} ${DOT_CLASS[event.type]}`}
                          title={event.title}
                        >
                          <span className={styles['schedule__dot-letter']} aria-hidden="true">
                            {TYPE_LETTER[event.type]}
                          </span>
                        </span>
                      ))}
                    </span>
                  ) : null}
                </>
              );

              return dayEvents.length > 0 ? (
                <button
                  key={cell.key}
                  type="button"
                  className={`${cellClass} ${styles['schedule__month-cell--active']}`}
                  aria-label={`${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'} on ${formatDate(
                    `${cell.key}T12:00:00+01:00`,
                  )}`}
                  onClick={() => {
                    setExpandedEventId(null);
                    setSelectedDay(cell.key);
                  }}
                >
                  {inner}
                </button>
              ) : (
                <div key={cell.key} className={cellClass}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={styles.schedule__list}>
          {visibleDays.map(([key, dayEvents]) => (
            <section key={key} className={styles.schedule__day}>
              <h2 className={styles['schedule__day-heading']}>
                {formatDate(`${key}T12:00:00+01:00`)}
              </h2>
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className={styles.schedule__event}
                  onClick={() => setSelected(event)}
                >
                  <span className={styles['schedule__event-main']}>
                    <span className={styles['schedule__event-time']}>{whenText(event)}</span>
                    <span className={styles['schedule__event-title']}>{event.title}</span>
                    {event.location ? (
                      <span className={styles['schedule__event-location']}>{event.location}</span>
                    ) : null}
                  </span>
                  <span className={`${styles.schedule__badge} ${TYPE_CLASS[event.type]}`}>
                    {eventTypeLabel(event.type)}
                  </span>
                </button>
              ))}
            </section>
          ))}
          {visibleDays.length === 0 ? (
            <p className={styles.schedule__empty}>
              {typeFilter === 'all'
                ? 'Nothing on the parish calendar for this month.'
                : 'No events of this type this month.'}
            </p>
          ) : null}
        </div>
      )}

      {selectedDay ? (
        <ScheduleOverlay
          label={`Events on ${formatDate(`${selectedDay}T12:00:00+01:00`)}`}
          onClose={() => setSelectedDay(null)}
        >
          <h2 className={styles['schedule__day-modal-title']}>
            {formatDate(`${selectedDay}T12:00:00+01:00`)}
          </h2>
          <ul className={styles['schedule__day-modal-list']}>
            {selectedDayEvents.map((event) => {
              const open = expandedEventId === event.id;
              return (
                <li key={event.id} className={styles['schedule__day-item']}>
                  <button
                    type="button"
                    className={styles['schedule__day-item-header']}
                    aria-expanded={open}
                    onClick={() => setExpandedEventId(open ? null : event.id)}
                  >
                    <span className={styles['schedule__day-item-time']}>{whenText(event)}</span>
                    <span className={styles['schedule__day-item-title']}>{event.title}</span>
                    <span
                      className={`${styles['schedule__dot']} ${DOT_CLASS[event.type]}`}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    className={`${styles['schedule__day-item-panel']} ${
                      open ? styles['schedule__day-item-panel--open'] : ''
                    }`}
                    inert={!open || undefined}
                  >
                    <div className={styles['schedule__day-item-detail']}>
                      <span className={`${styles.schedule__badge} ${TYPE_CLASS[event.type]}`}>
                        {eventTypeLabel(event.type)}
                      </span>
                      {renderDetail(event, true)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </ScheduleOverlay>
      ) : null}

      {selected ? (
        <ScheduleOverlay label={selected.title} onClose={() => setSelected(null)}>
          <div className={styles['schedule__event-modal']}>
            <span className={`${styles.schedule__badge} ${TYPE_CLASS[selected.type]}`}>
              {eventTypeLabel(selected.type)}
            </span>
            <h2 className={styles['schedule__modal-title']}>{selected.title}</h2>
            {renderDetail(selected)}
          </div>
        </ScheduleOverlay>
      ) : null}
    </div>
  );
}
