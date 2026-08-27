'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Announcement } from '@/lib/types';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import AnnouncementModal from '@/components/announcements/AnnouncementModal';
import { formatDate, formatTime, dateBlockParts } from '@/lib/format';
import styles from './page.module.scss';

interface HomeAnnouncementsSectionProps {
  featuredAnnouncement: Announcement | undefined;
  listedAnnouncements: Announcement[];
}

/** Homepage "Announcements" panel (featured + list) — opens the shared modal in place. */
export default function HomeAnnouncementsSection({
  featuredAnnouncement,
  listedAnnouncements,
}: HomeAnnouncementsSectionProps): React.JSX.Element {
  const [selected, setSelected] = useState<Announcement | null>(null);

  return (
    <div className={styles.announcements}>
      <SectionTitle eyebrow="Parish Notices" title="Announcements" />

      {featuredAnnouncement ? (
        <button
          type="button"
          onClick={() => setSelected(featuredAnnouncement)}
          className={styles['announcements__featured-card']}
        >
          <div className={styles['announcements__featured-image']}>
            <Image
              src={featuredAnnouncement.image ?? featuredAnnouncement.society.logo}
              alt=""
              fill
              sizes="(min-width: 768px) 280px, 100vw"
              className={styles['announcements__featured-photo']}
            />
          </div>
          <div className={styles['announcements__featured-info']}>
            <span className={styles['announcements__featured-tag']}>Featured</span>
            <h3 className={styles['announcements__featured-title']}>
              {featuredAnnouncement.title}
            </h3>
            {featuredAnnouncement.eventDate ? (
              <p className={styles['announcements__meta-row']}>
                <Image src="/icons/calendar.svg" alt="" width={24} height={24} />
                <span>
                  {formatDate(featuredAnnouncement.eventDate)} •{' '}
                  {formatTime(featuredAnnouncement.eventDate)}
                </span>
              </p>
            ) : null}
            {featuredAnnouncement.eventLocation ? (
              <p className={styles['announcements__meta-row']}>
                <Image src="/icons/location.svg" alt="" width={24} height={24} />
                <span>{featuredAnnouncement.eventLocation}</span>
              </p>
            ) : null}
            <p className={styles['announcements__featured-excerpt']}>
              {featuredAnnouncement.excerpt}
            </p>
          </div>
        </button>
      ) : null}

      <div className={styles['announcements__list']}>
        {listedAnnouncements.map((announcement) => {
          const dateParts = dateBlockParts(announcement.eventDate ?? announcement.publishedAt);
          return (
            <button
              key={announcement.slug}
              type="button"
              onClick={() => setSelected(announcement)}
              className={styles['announcements__item']}
            >
              <span className={styles['announcements__date-block']}>
                <span className={styles['announcements__date-weekday']}>
                  {dateParts.weekday}
                </span>
                <span className={styles['announcements__date-day']}>{dateParts.day}</span>
                <span className={styles['announcements__date-month']}>{dateParts.month}</span>
              </span>
              <span className={styles['announcements__item-image']}>
                <Image
                  src={announcement.image ?? announcement.society.logo}
                  alt=""
                  fill
                  sizes="159px"
                  className={styles['announcements__item-photo']}
                />
              </span>
              <span className={styles['announcements__item-text']}>
                <span className={styles['announcements__item-title']}>{announcement.title}</span>
                <span className={styles['announcements__item-excerpt']}>
                  {announcement.excerpt}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <Button href="/announcements" variant="outline" size="sm">
        View All Announcements →
      </Button>

      {selected ? (
        <AnnouncementModal announcement={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
