import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import { siteSettings } from '@/lib/site';
import { getDailyReadings } from '@/lib/readings';
import { getAnnouncements } from '@/lib/announcements';
import { getHomilies } from '@/lib/homilies';
import { getClergy } from '@/lib/clergy';
import { getAlbums } from '@/lib/gallery';
import { formatDate, formatTime, dateBlockParts } from '@/lib/format';
import styles from './page.module.scss';

// Announcements and homilies feed the homepage — ISR every 10 minutes.
export const revalidate = 600;

export const metadata: Metadata = {
  title: `${siteSettings.parishName} — ${siteSettings.location}`,
  description:
    'A community of faith, worship, and service in the heart of Ikeja, Lagos. Mass times, daily readings, announcements, homilies, and more.',
};

const READING_ICONS: Record<string, string> = {
  'First Reading': '/icons/reading-bible.svg',
  'Responsorial Psalm': '/icons/reading-harp.svg',
  'Second Reading': '/icons/reading-cross.svg',
};

export default async function HomePage(): Promise<React.JSX.Element> {
  const [readings, announcements, homilies, clergy, albums] = await Promise.all([
    getDailyReadings(),
    getAnnouncements(),
    getHomilies(),
    getClergy(),
    getAlbums(),
  ]);

  const gospel = readings.readings.find((r) => r.label === 'Gospel');
  const otherReadings = readings.readings.filter((r) => r.label !== 'Gospel');
  const latestHomily = homilies[0];
  const featuredAnnouncement = announcements[0];
  const listedAnnouncements = announcements.slice(1, 4);
  const cardAnnouncement =
    announcements.find((a) => a.slug === 'corpus-christi-procession') ?? announcements[0];
  const priests = clergy.filter((member) => member.role === 'priest');
  const clergyCards = clergy.slice(0, 4);
  const galleryAlbums = albums.slice(0, 5);

  return (
    <div className={styles.home}>
      {/* ---------- Hero ---------- */}
      <section className={styles.hero}>
        <Image
          src="/images/hero-bg.png"
          alt="Light falling through the windows of the Catholic Church of the Ascension"
          fill
          priority
          sizes="100vw"
          className={styles['hero__bg-image']}
        />
        <div className={styles['hero__text-group']}>
          <p className={styles.hero__eyebrow}>Parish of the Archdiocese of Lagos</p>
          <h1 className={styles.hero__title}>
            Catholic Church
            <br />
            of the Ascension
          </h1>
          <p className={styles.hero__subtitle}>
            A community of faith, worship, and service
            <br />
            in the heart of Ikeja, Lagos.
          </p>
          <div className={styles['hero__cta-group']}>
            <Button href="/schedule" variant="primary" size="lg">
              Mass Times
            </Button>
            <Button href="/livestream" variant="ghost-inverse" size="lg">
              Watch Live
            </Button>
          </div>
        </div>
      </section>

      {/* ---------- Parish motto ---------- */}
      <section className={styles.motto} aria-label="Parish motto">
        <Image
          src="/images/parish-slogan.svg"
          alt="Pro Deo et pro Gloria Eius — For God and for His glory"
          width={850}
          height={122}
          className={styles.motto__image}
        />
      </section>

      {/* ---------- Mass times strip ---------- */}
      <section className={styles['mass-times']} aria-label="Mass times">
        {siteSettings.massTimes.map((group) => (
          <div key={group.heading} className={styles['mass-times__item']}>
            <p className={styles['mass-times__heading']}>{group.heading}</p>
            {group.times.map((time) => (
              <p key={time} className={styles['mass-times__time']}>
                {time}
              </p>
            ))}
            <p className={styles['mass-times__note']}>{group.note}</p>
          </div>
        ))}
      </section>

      {/* ---------- Quick updates ---------- */}
      <section className={styles['quick-updates']} aria-label="Parish updates">
        <article className={styles['quick-updates__card']}>
          <Image
            src="/images/card-sunday.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className={styles['quick-updates__bg']}
          />
          <div className={styles['quick-updates__panel']}>
            <div className={styles['quick-updates__info']}>
              <p className={styles['quick-updates__label']}>This Sunday</p>
              <h3 className={styles['quick-updates__title']}>The Most Holy Trinity</h3>
              <p className={styles['quick-updates__text']}>
                Join us for the Solemnity of the Most Holy Trinity.{' '}
                {priests[0]?.name ?? 'Our clergy'} will preside at the 11 o&apos;clock
                Mass. All are welcome to the table of the Lord.
              </p>
            </div>
            <Button href="/schedule" variant="ghost-inverse" size="sm">
              View Schedule →
            </Button>
          </div>
        </article>

        {latestHomily ? (
          <article className={styles['quick-updates__card']}>
            <Image
              src="/images/card-homily.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className={styles['quick-updates__bg']}
            />
            <div className={styles['quick-updates__panel']}>
              <div className={styles['quick-updates__info']}>
                <p className={styles['quick-updates__label']}>Latest Homily</p>
                <h3 className={styles['quick-updates__title']}>{latestHomily.title}</h3>
                <p className={styles['quick-updates__text']}>
                  {latestHomily.authorName} reflects on {latestHomily.scriptureReference};{' '}
                  {latestHomily.body[0]?.replace(/\.$/, '')}. Duration:{' '}
                  {latestHomily.audioDuration} minutes.
                </p>
              </div>
              <Button href={`/homilies/${latestHomily.slug}`} variant="ghost-inverse" size="sm">
                Listen Now →
              </Button>
            </div>
          </article>
        ) : null}

        {cardAnnouncement ? (
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
                <h3 className={styles['quick-updates__title']}>{cardAnnouncement.title}</h3>
                <p className={styles['quick-updates__text']}>{cardAnnouncement.excerpt}</p>
              </div>
              <Button
                href={`/announcements/${cardAnnouncement.slug}`}
                variant="ghost-inverse"
                size="sm"
              >
                Read More →
              </Button>
            </div>
          </article>
        ) : null}
      </section>

      {/* ---------- Readings & Announcements ---------- */}
      <section className={styles['readings-announcements']}>
        <div className={styles.readings}>
          <SectionTitle eyebrow="Liturgy of the Word" title="Today’s Readings" />

          <div className={styles['readings__liturgy-header']}>
            <div className={styles['readings__solemnity-info']}>
              <p className={styles['readings__day-cell']}>
                {readings.liturgicalDay} • {readings.lectionaryYear}
              </p>
              <p className={styles['readings__season-badge']}>
                <Image src="/icons/season-badge.svg" alt="" width={24} height={32} />
                <span>{readings.season} Season</span>
              </p>
            </div>

            {gospel ? (
              <div className={styles['readings__gospel-card']}>
                <div className={styles['readings__gospel-image']}>
                  <Image
                    src="/images/gospel_image.png"
                    alt="Icon of Christ teaching"
                    fill
                    sizes="(min-width: 768px) 330px, 100vw"
                    className={styles['readings__gospel-photo']}
                  />
                </div>
                <div className={styles['readings__gospel-info']}>
                  <p className={styles['readings__gospel-label']}>Gospel</p>
                  <p className={styles['readings__gospel-reference']}>{gospel.reference}</p>
                  <p className={styles['readings__gospel-excerpt']}>{gospel.excerpt}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className={styles['readings__other-readings']}>
            {otherReadings.map((reading) => (
              <div key={reading.label} className={styles['readings__reading-row']}>
                <span className={styles['readings__reading-icon']}>
                  <Image
                    src={READING_ICONS[reading.label] ?? '/icons/reading-bible.svg'}
                    alt=""
                    width={100}
                    height={100}
                  />
                </span>
                <div className={styles['readings__reading-info']}>
                  <p className={styles['readings__reading-label']}>{reading.label}</p>
                  <p className={styles['readings__reading-reference']}>{reading.reference}</p>
                  <p className={styles['readings__reading-excerpt']}>{reading.excerpt}</p>
                </div>
              </div>
            ))}
          </div>

          <Button href="/readings" variant="outline" size="sm">
            Full Readings →
          </Button>
        </div>

        <div className={styles.announcements}>
          <SectionTitle eyebrow="Parish Notices" title="Announcements" />

          {featuredAnnouncement ? (
            <Link
              href={`/announcements/${featuredAnnouncement.slug}`}
              className={styles['announcements__featured-card']}
            >
              <div className={styles['announcements__featured-image']}>
                <Image
                  // src={featuredAnnouncement.image}
                  src="/images/announcement_image.png"
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
            </Link>
          ) : null}

          <div className={styles['announcements__list']}>
            {listedAnnouncements.map((announcement) => {
              const dateParts = dateBlockParts(
                announcement.eventDate ?? announcement.publishedAt,
              );
              return (
                <Link
                  key={announcement.slug}
                  href={`/announcements/${announcement.slug}`}
                  className={styles['announcements__item']}
                >
                  <span className={styles['announcements__date-block']}>
                    <span className={styles['announcements__date-weekday']}>
                      {dateParts.weekday}
                    </span>
                    <span className={styles['announcements__date-day']}>{dateParts.day}</span>
                    <span className={styles['announcements__date-month']}>
                      {dateParts.month}
                    </span>
                  </span>
                  <span className={styles['announcements__item-image']}>
                    <Image
                      src={announcement.image}
                      alt=""
                      fill
                      sizes="159px"
                      className={styles['announcements__item-photo']}
                    />
                  </span>
                  <span className={styles['announcements__item-text']}>
                    <span className={styles['announcements__item-title']}>
                      {announcement.title}
                    </span>
                    <span className={styles['announcements__item-excerpt']}>
                      {announcement.excerpt}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          <Button href="/announcements" variant="outline" size="sm">
            View All Announcements →
          </Button>
        </div>
      </section>

      {/* ---------- Support the mission ---------- */}
      <section className={styles.support}>
        <div className={styles.support__content}>
          <p className={styles.support__eyebrow}>Stewardship &amp; Giving</p>
          <h2 className={styles.support__title}>
            Support the Mission
            <br />
            of the Parish
          </h2>
          <p className={styles.support__text}>
            Your generosity sustains the life and ministry of our parish community, from the
            celebration of the sacraments to outreach for those most in need. Every gift,
            great or small, is an act of worship.
          </p>
          <Button href="/give" variant="primary" size="lg">
            Make a Donation
          </Button>
        </div>
        <Image
          src="/icons/ascension_logo_light.svg"
          alt=""
          width={353}
          height={351}
          className={styles.support__watermark}
        />
      </section>

      {/* ---------- Our clergy ---------- */}
      <section className={styles.clergy}>
        <SectionTitle
          eyebrow="Shepherds of the Flock"
          title="Our Clergy"
          underlined
          action={
            <Button href="/clergy" variant="outline" size="sm">
              Meet All Clergy →
            </Button>
          }
        />
        <div className={styles['clergy__card-grid']}>
          {clergyCards.map((member) => (
            <Link
              key={member.slug}
              href="/clergy"
              className={styles['clergy__card']}
            >
              <span className={styles['clergy__avatar-frame']}>
                <Image
                  src={member.photo}
                  alt={`Portrait of ${member.name}`}
                  fill
                  sizes="(min-width: 1024px) 270px, (min-width: 768px) 50vw, 100vw"
                  className={styles['clergy__photo']}
                />
              </span>
              <span className={styles['clergy__info']}>
                <span className={styles['clergy__name']}>{member.name}</span>
                <span className={styles['clergy__role']}>
                  {member.role === 'priest' && member.order === 1
                    ? 'Parish Priest'
                    : member.role === 'priest'
                      ? 'Priest'
                      : member.role === 'reverend_sister'
                        ? 'Reverend Sister'
                        : 'Catechist'}
                </span>
                <span className={styles['clergy__bio']}>{member.bio}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Gallery ---------- */}
      <section className={styles.gallery}>
        <SectionTitle
          eyebrow="Parish Life"
          title="Gallery"
          action={
            <Button href="/gallery" variant="outline" size="sm">
              View All Albums →
            </Button>
          }
        />
        <div className={styles.gallery__grid}>
          {galleryAlbums.map((album, index) => (
            <Link
              key={album.slug}
              href={`/gallery/${album.slug}`}
              className={`${styles.gallery__item} ${
                index === 0 ? styles['gallery__item--large'] : ''
              }`}
            >
              <Image
                src={album.coverImage}
                alt={album.description}
                fill
                sizes={index === 0 ? '(min-width: 1024px) 700px, 100vw' : '(min-width: 1024px) 350px, 50vw'}
                className={styles.gallery__photo}
              />
              <span className={styles.gallery__caption}>
                {album.title} — {formatDate(album.eventDate)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- RCIA ---------- */}
      <section className={styles.rcia}>
        <div className={styles.rcia__content}>
          <p className={styles.rcia__eyebrow}>Rite of Christian Initiation of Adults</p>
          <h2 className={styles.rcia__title}>
            Are You Called
            <br />
            to the Catholic Faith?
          </h2>
          <p className={styles.rcia__text}>
            The RCIA journey is an invitation to explore the richness of the Catholic
            tradition — its sacraments, its teachings, and its community. We walk alongside
            you every step of the way, from your first question to the Easter Vigil.
          </p>
          <Button href="/sacraments/rcia" variant="primary" size="lg">
            Begin Your Journey →
          </Button>
        </div>
        <div className={styles['rcia__image-frame']}>
          <Image
            src="/images/rcia-photo.png"
            alt="Stained glass window depicting the Ascension"
            fill
            sizes="(min-width: 1024px) 570px, 100vw"
            className={styles.rcia__photo}
          />
        </div>
      </section>
    </div>
  );
}
