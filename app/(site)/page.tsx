import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import { getSiteSettings } from '@/lib/site';
import { getLagosToday, getScheduleData } from '@/lib/schedule';
import { getScheduleWeek } from '@/lib/calendar';
import { getAnnouncements } from '@/lib/announcements';
import { getHomilies } from '@/lib/homilies';
import { getClergy } from '@/lib/clergy';
import { getAlbums } from '@/lib/gallery';
import { formatDate } from '@/lib/format';
import { buildPageMetadata } from '@/lib/metadata';
import HomeAnnouncementsSection from './HomeAnnouncementsSection';
import HomeReadingsSection from './HomeReadingsSection';
import styles from './page.module.scss';

// Announcements and homilies feed the homepage — ISR every 10 minutes.
export const revalidate = 600;

export const metadata = buildPageMetadata({
  path: '/',
  title: 'Catholic Church of the Ascension — MMIA, Ikeja, Lagos',
  absoluteTitle: true,
  description:
    'A community of faith, worship, and service in the heart of Ikeja, Lagos. Mass times, daily readings, announcements, homilies, and more.',
});

export default async function HomePage(): Promise<React.JSX.Element> {
  const today = getLagosToday();
  const [siteSettings, scheduleData, announcements, homilies, clergy, albums] =
    await Promise.all([
      getSiteSettings(),
      getScheduleData(today),
      getAnnouncements(),
      getHomilies(),
      getClergy(),
      getAlbums(),
    ]);
  const week = getScheduleWeek(scheduleData, today);

  const latestHomily = homilies[0];
  const featuredAnnouncement = announcements[0];
  const listedAnnouncements = announcements.slice(1, 4);
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
      <section className={styles['quick-updates']} aria-label="Explore the parish">
        <article className={styles['quick-updates__card']}>
          <Image
            src="/images/img_card1.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className={styles['quick-updates__bg']}
          />
          <div className={styles['quick-updates__panel']}>
            <div className={styles['quick-updates__info']}>
              <p className={styles['quick-updates__label']}>Upcoming</p>
              <h3 className={styles['quick-updates__title']}>The Parish Calendar</h3>
              <p className={styles['quick-updates__text']}>
                Sunday and weekday Mass times, confessions, novenas, and every feast
                and parish celebration. The full schedule is always kept current.
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
              src="/images/img_card2.png"
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
                  Preached {formatDate(latestHomily.publishedAt)} by {latestHomily.authorName}.{' '}
                  {latestHomily.audioUrl
                    ? 'Press play for the full reflection.'
                    : 'Read the full reflection.'}
                </p>
              </div>
              <Button
                href={
                  latestHomily.audioUrl
                    ? `/homilies?play=${latestHomily.slug}`
                    : `/homilies?read=${latestHomily.slug}`
                }
                variant="ghost-inverse"
                size="sm"
              >
                {latestHomily.audioUrl ? 'Listen Now →' : 'Read Homily →'}
              </Button>
            </div>
          </article>
        ) : null}

        <article className={styles['quick-updates__card']}>
          <Image
            src="/images/img_card3.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className={styles['quick-updates__bg']}
          />
          <div className={styles['quick-updates__panel']}>
            <div className={styles['quick-updates__info']}>
              <p className={styles['quick-updates__label']}>Societies &amp; Zones</p>
              <h3 className={styles['quick-updates__title']}>Find Your Place in the Parish</h3>
              <p className={styles['quick-updates__text']}>
                From the parish zones to the choirs, guilds, and devotional societies,
                there is a community here ready to welcome you.
              </p>
            </div>
            <Button href="/societies" variant="ghost-inverse" size="sm">
              Explore Societies →
            </Button>
          </div>
        </article>
      </section>

      {/* ---------- Readings & Announcements ---------- */}
      <section className={styles['readings-announcements']}>
        <HomeReadingsSection serverDate={today} />

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
