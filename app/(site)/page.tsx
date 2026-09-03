import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import { getSiteSettings } from '@/lib/site';
import { getLagosToday, getScheduleData } from '@/lib/schedule';
import { getScheduleWeek } from '@/lib/calendar';
import { getDailyReadings } from '@/lib/readings';
import { getAnnouncements } from '@/lib/announcements';
import { getHomilies } from '@/lib/homilies';
import { getClergy } from '@/lib/clergy';
import { getAlbums } from '@/lib/gallery';
import { formatDuration } from '@/lib/format';
import { toPlainText } from '@/lib/portableText';
import HomeAnnouncementCard from './HomeAnnouncementCard';
import HomeAnnouncementsSection from './HomeAnnouncementsSection';
import styles from './page.module.scss';

// Announcements and homilies feed the homepage — ISR every 10 minutes.
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  return {
    title: `${siteSettings.parishName}`,
    description:
      'A community of faith, worship, and service in the heart of Ikeja, Lagos. Mass times, daily readings, announcements, homilies, and more.',
  };
}

const READING_ICONS: Record<string, string> = {
  'First Reading': '/icons/reading-bible.svg',
  'Responsorial Psalm': '/icons/reading-harp.svg',
  'Second Reading': '/icons/reading-bible.svg',
};

export default async function HomePage(): Promise<React.JSX.Element> {
  const today = getLagosToday();
  const [siteSettings, scheduleData, readings, announcements, homilies, clergy, albums] =
    await Promise.all([
      getSiteSettings(),
      getScheduleData(today),
      getDailyReadings(),
      getAnnouncements(),
      getHomilies(),
      getClergy(),
      getAlbums(),
    ]);
  const week = getScheduleWeek(scheduleData, today);

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
          <h1 className={styles.hero__title}>
            Catholic Church
            <br />
            of the Ascension
          </h1>
          <p className={styles.hero__subtitle}>
            A community of faith, worship, and service in the heart of Ikeja, Lagos.
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
      <section className={styles['mass-times']} aria-label="Mass and Confession times">
        <div className={styles['mass-times__item']}>
          <p className={styles['mass-times__heading']}>{week.sundayLabel}</p>
          {week.sundayMasses.map((mass) => (
            <p key={`${mass.title}-${mass.time}`} className={styles['mass-times__time']}>
              {mass.title} · {mass.time}
            </p>
          ))}
        </div>
        <div className={styles['mass-times__item']}>
          <p className={styles['mass-times__heading']}>This Week</p>
          {week.weekdayMasses.map((mass) => (
            <p key={`${mass.title}-${mass.time}`} className={styles['mass-times__time']}>
              {mass.title} · {mass.time}
            </p>
          ))}
        </div>
        {week.confession ? (
          <div className={styles['mass-times__item']}>
            <p className={styles['mass-times__heading']}>Confession</p>
            <p className={styles['mass-times__time']}>
              {week.confession.label} · {week.confession.time}
            </p>
          </div>
        ) : null}
        <div className={styles['mass-times__item']}>
          <p className={styles['mass-times__heading']}>Location</p>
          <p className={styles['mass-times__time']}>{siteSettings.location}</p>
          <p className={styles['mass-times__note']}>{siteSettings.address}</p>
        </div>
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
                  {latestHomily.authorName} reflects on{' '}
                  {latestHomily.scriptureReferences.join('; ')};{' '}
                  {toPlainText(latestHomily.body.slice(0, 1)).replace(/\.$/, '')}. Duration:{' '}
                  {formatDuration(latestHomily.audioDurationSeconds)} minutes.
                </p>
              </div>
              <Button href={`/homilies?play=${latestHomily.slug}`} variant="ghost-inverse" size="sm">
                Listen Now →
              </Button>
            </div>
          </article>
        ) : null}

        {cardAnnouncement ? <HomeAnnouncementCard announcement={cardAnnouncement} /> : null}
      </section>

      {/* ---------- Readings & Announcements ---------- */}
      <section className={styles['readings-announcements']}>
        <div className={styles.readings}>
          <SectionTitle eyebrow="Liturgy of the Word" title="Today’s Readings" />

          <div className={styles['readings__liturgy-header']}>
            <div className={styles['readings__solemnity-info']}>
              <div className={styles['readings__day-cell']}>
                {readings.celebrations.map((cel) => (
                  <p key={cel} className={styles['readings__day-celebration']}>{cel}</p>
                ))}
              </div>
              <div
                className={styles['readings__season-badge']}
                style={{ backgroundColor: `var(${readings.colourVar})` }}
              >
                <Image src="/icons/season-badge.svg" alt="" width={20} height={28} />
                <div>
                  <p className={styles['readings__season-badge-name']}>{readings.season}</p>
                  <p className={styles['readings__season-badge-year']}>{readings.lectionaryYear}</p>
                </div>
              </div>
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
                  <span className={styles['readings__gospel-icon']}>
                    <Image src="/icons/reading-cross.svg" alt="" width={72} height={72} />
                  </span>
                  <div className={styles['readings__gospel-text']}>
                    <p className={styles['readings__gospel-label']}>Gospel</p>
                    <p className={styles['readings__gospel-reference']}>{gospel.reference}</p>
                    <p className={styles['readings__gospel-excerpt']}>{gospel.excerpt}</p>
                  </div>
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
                  <p
                    className={
                      reading.label === 'Responsorial Psalm'
                        ? styles['readings__reading-chorus']
                        : styles['readings__reading-excerpt']
                    }
                  >
                    {reading.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button href="/readings" variant="outline" size="sm">
            Full Readings →
          </Button>
        </div>

        <HomeAnnouncementsSection
          featuredAnnouncement={featuredAnnouncement}
          listedAnnouncements={listedAnnouncements}
        />
      </section>

      {/* ---------- Discover the parish ---------- */}
      <section className={styles.support}>
        <div className={styles.support__content}>
          <p className={styles.support__eyebrow}>Welcome to Ascension</p>
          <h2 className={styles.support__title}>
            Discover the Life of Our Parish
          </h2>
          <p className={styles.support__text}>
            Drawn from every corner of Nigeria and beyond, the Catholic Church of the
            Ascension is a community shaped by the liturgy we celebrate, the disciples we
            form, and the charity we practise. Learn about our history, our patrons, and
            the many societies that carry the life of the parish.
          </p>
          <Button href="/about" variant="primary" size="lg">
            Learn More About Us
          </Button>
        </div>
        <div className={styles.support__image}>
          <Image
            src="/images/church_w_logo.png"
            alt="Catholic Church of the Ascension building"
            fill
            sizes="(min-width: 768px) 400px, 100vw"
            className={styles['support__image-img']}
          />
        </div>
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
              <span className={styles.gallery__badge}>
                <span
                  className={styles['gallery__badge-pill']}
                  style={{ backgroundColor: album.society.color }}
                >
                  <Image
                    src={album.society.logo}
                    alt=""
                    fill
                    sizes="60px"
                    className={styles['gallery__badge-img']}
                  />
                </span>
              </span>
              <Image
                src={album.coverImage}
                alt={album.description}
                fill
                sizes={index === 0 ? '(min-width: 1024px) 700px, 100vw' : '(min-width: 1024px) 350px, 50vw'}
                className={styles.gallery__photo}
              />
              <span className={styles.gallery__caption}>{album.title}</span>
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
