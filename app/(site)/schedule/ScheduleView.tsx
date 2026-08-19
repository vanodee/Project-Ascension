'use client';

import { useMemo, useState } from 'react';
import type { CalendarEvent, CalendarEventType } from '@/lib/types';
import { eventTypeLabel } from '@/lib/calendar';
import { formatDate, formatTime } from '@/lib/format';
import styles from './ScheduleView.module.scss';

interface ScheduleViewProps {
  events: CalendarEvent[];
}

type TypeFilter = 'all' | CalendarEventType;
type ViewMode = 'list' | 'month';

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
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

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Parish schedule with list and month views, filterable by event type.
 * List view is the default (and the only sensible view on mobile, per the PRD).
 */
export default function ScheduleView({ events }: ScheduleViewProps): React.JSX.Element {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const filtered = useMemo(
    () => events.filter((event) => typeFilter === 'all' || event.type === typeFilter),
    [events, typeFilter],
  );

  const groupedByDay = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();
    for (const event of filtered) {
      const key = dayKey(event.start);
      const list = groups.get(key) ?? [];
      list.push(event);
      groups.set(key, list);
    }
    return [...groups.entries()];
  }, [filtered]);

  const monthGrid = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingBlanks = firstDay.getDay();
    const cells: { date: Date | null; events: CalendarEvent[] }[] = [];

    for (let i = 0; i < leadingBlanks; i += 1) {
      cells.push({ date: null, events: [] });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        date,
        events: filtered.filter((event) => dayKey(event.start) === key),
      });
    }
    return { cells, monthLabel: now.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' }) };
  }, [filtered]);

  return (
    <div className={styles.schedule}>
      <div className={styles.schedule__toolbar}>
        <div className={styles.schedule__filters} role="group" aria-label="Filter by event type">
          {TYPE_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.schedule__filter} ${
                typeFilter === option.value ? styles['schedule__filter--active'] : ''
              }`}
              aria-pressed={typeFilter === option.value}
              onClick={() => setTypeFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className={styles['schedule__view-toggle']} role="group" aria-label="Calendar view">
          {(['list', 'month'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`${styles.schedule__filter} ${
                viewMode === mode ? styles['schedule__filter--active'] : ''
              }`}
              aria-pressed={viewMode === mode}
              onClick={() => setViewMode(mode)}
            >
              {mode === 'list' ? 'List' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className={styles.schedule__list}>
          {groupedByDay.map(([key, dayEvents]) => (
            <section key={key} className={styles.schedule__day}>
              <h2 className={styles['schedule__day-heading']}>
                {formatDate(`${key}T00:00:00`)}
              </h2>
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className={styles.schedule__event}
                  onClick={() => setSelected(event)}
                >
                  <span className={styles['schedule__event-time']}>
                    {formatTime(event.start)}
                  </span>
                  <span className={styles['schedule__event-main']}>
                    <span className={styles['schedule__event-title']}>{event.title}</span>
                    <span className={styles['schedule__event-location']}>
                      {event.location}
                    </span>
                  </span>
                  <span className={`${styles.schedule__badge} ${TYPE_CLASS[event.type]}`}>
                    {eventTypeLabel(event.type)}
                  </span>
                </button>
              ))}
            </section>
          ))}
          {groupedByDay.length === 0 ? (
            <p className={styles.schedule__empty}>No upcoming events of this type.</p>
          ) : null}
        </div>
      ) : (
        <div className={styles.schedule__month}>
          <h2 className={styles['schedule__month-label']}>{monthGrid.monthLabel}</h2>
          <div className={styles['schedule__month-weekdays']}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <span key={day} className={styles['schedule__month-weekday']}>
                {day}
              </span>
            ))}
          </div>
          <div className={styles['schedule__month-grid']}>
            {monthGrid.cells.map((cell, index) => (
              <div
                key={cell.date ? cell.date.toISOString() : `blank-${index}`}
                className={`${styles['schedule__month-cell']} ${
                  cell.date ? '' : styles['schedule__month-cell--blank']
                }`}
              >
                {cell.date ? (
                  <>
                    <span className={styles['schedule__month-day']}>
                      {cell.date.getDate()}
                    </span>
                    {cell.events.slice(0, 3).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className={`${styles['schedule__month-event']} ${TYPE_CLASS[event.type]}`}
                        onClick={() => setSelected(event)}
                      >
                        {event.title}
                      </button>
                    ))}
                    {cell.events.length > 3 ? (
                      <span className={styles['schedule__month-more']}>
                        +{cell.events.length - 3} more
                      </span>
                    ) : null}
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {selected ? (
        <div
          className={styles.schedule__modal}
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          onClick={() => setSelected(null)}
        >
          <div
            className={styles['schedule__modal-inner']}
            onClick={(event) => event.stopPropagation()}
          >
            <span className={`${styles.schedule__badge} ${TYPE_CLASS[selected.type]}`}>
              {eventTypeLabel(selected.type)}
            </span>
            <h2 className={styles['schedule__modal-title']}>{selected.title}</h2>
            <p className={styles['schedule__modal-meta']}>
              {formatDate(selected.start)} • {formatTime(selected.start)} –{' '}
              {formatTime(selected.end)}
            </p>
            <p className={styles['schedule__modal-meta']}>{selected.location}</p>
            <p className={styles['schedule__modal-description']}>{selected.description}</p>
            <button
              type="button"
              className={styles['schedule__modal-close']}
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
