'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Announcement } from '@/lib/types';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import AnnouncementModal from '@/components/announcements/AnnouncementModal';
import { formatDate, formatTime } from '@/lib/format';
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
          <span className={styles['announcements__featured-image']}>
            {featuredAnnouncement.image ? (
              <Image
                src={featuredAnnouncement.image}
                alt=""
                fill
                sizes="(min-width: 768px) 280px, 100vw"
                className={styles['announcements__featured-photo']}
              />
            ) : (
              <span
                className={styles['announcements__fallback']}
                style={{
                  background: `linear-gradient(to bottom, ${featuredAnnouncement.society.color}, transparent)`,
                }}
              >
                <Image
                  src="/images/Announcement Default.png"
                  alt=""
                  width={408}
                  height={230}
                  className={styles['announcements__fallback-icon']}
                />
              </span>
            )}
            <span className={styles['announcements__logo']}>
              <Image
                src={featuredAnnouncement.society.logo}
                alt=""
                fill
                sizes="48px"
                className={styles['announcements__logo-img']}
              />
            </span>
            <span className={styles['announcements__featured-tag']}>Featured</span>
          </span>
          <span className={styles['announcements__featured-info']}>
            <span className={styles['announcements__featured-title']}>
              {featuredAnnouncement.title}
            </span>
            {featuredAnnouncement.eventDate ? (
              <span className={styles['announcements__meta-row']}>
                <Image src="/icons/calendar.svg" alt="" width={24} height={24} />
                <span>
                  {formatDate(featuredAnnouncement.eventDate)} •{' '}
                  {formatTime(featuredAnnouncement.eventDate)}
                </span>
              </span>
            ) : null}
            {featuredAnnouncement.eventLocation ? (
              <span className={styles['announcements__meta-row']}>
                <Image src="/icons/location.svg" alt="" width={24} height={24} />
                <span>{featuredAnnouncement.eventLocation}</span>
              </span>
            ) : null}
            <span className={styles['announcements__featured-excerpt']}>
              {featuredAnnouncement.excerpt}
            </span>
          </span>
        </button>
      ) : null}

      <div className={styles['announcements__list']}>
        {listedAnnouncements.map((announcement) => (
          <button
            key={announcement.slug}
            type="button"
            onClick={() => setSelected(announcement)}
            className={styles['announcements__item']}
          >
            <span className={styles['announcements__item-image']}>
              {announcement.image ? (
                <Image
                  src={announcement.image}
                  alt=""
                  fill
                  sizes="220px"
                  className={styles['announcements__item-photo']}
                />
              ) : (
                <span
                  className={styles['announcements__fallback']}
                  style={{
                    background: `linear-gradient(to bottom, ${announcement.society.color}, transparent)`,
                  }}
                >
                  <Image
                    src="/images/Announcement Default.png"
                    alt=""
                    width={408}
                    height={230}
                    className={styles['announcements__fallback-icon']}
                  />
                </span>
              )}
              <span className={styles['announcements__logo']}>
                <Image
                  src={announcement.society.logo}
                  alt=""
                  fill
                  sizes="48px"
                  className={styles['announcements__logo-img']}
                />
              </span>
            </span>
            <span className={styles['announcements__item-text']}>
              <span className={styles['announcements__item-title']}>{announcement.title}</span>
              <span className={styles['announcements__item-excerpt']}>
                {announcement.excerpt}
              </span>
            </span>
          </button>
        ))}
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
