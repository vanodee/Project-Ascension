'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Announcement } from '@/lib/types';
import Button from '@/components/ui/Button';
import AnnouncementModal from '@/components/announcements/AnnouncementModal';
import styles from './page.module.scss';

interface HomeAnnouncementCardProps {
  announcement: Announcement;
}

/** "Quick updates" homepage card for the current announcement — opens the shared modal in place. */
export default function HomeAnnouncementCard({
  announcement,
}: HomeAnnouncementCardProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article className={styles['quick-updates__card']}>
        <Image
          src="/images/card-announcement.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className={styles['quick-updates__bg']}
        />
        <div className={styles['quick-updates__panel']}>
          <div className={styles['quick-updates__info']}>
            <p className={styles['quick-updates__label']}>Announcements</p>
            <h3 className={styles['quick-updates__title']}>{announcement.title}</h3>
            <p className={styles['quick-updates__text']}>{announcement.excerpt}</p>
          </div>
          <Button onClick={() => setOpen(true)} variant="ghost-inverse" size="sm">
            Read More →
          </Button>
        </div>
      </article>

      {open ? <AnnouncementModal announcement={announcement} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
