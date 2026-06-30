import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'The history and mission of the Catholic Church of the Ascension, MMIA, Ikeja, Lagos — a parish of the Catholic Archdiocese of Lagos.',
};

interface Milestone {
  year: string;
  title: string;
  tag: string;
  description: string;
}

const milestones: Milestone[] = [
  {
    year: '1962',
    title: 'A Chapel at the Airport',
    tag: 'Ikeja',
    description:
      'A small chapel is established to serve Catholic travellers and workers at the Lagos international airport, with Mass said by visiting priests.',
  },
  {
    year: '1978',
    title: 'Parish Erected',
    tag: 'Lagos',
    description:
      'The chaplaincy is formally erected as a parish of the Archdiocese of Lagos under the title of the Ascension of the Lord.',
  },
  {
    year: '1994',
    title: 'The Present Church',
    tag: 'Ascension',
    description:
      'The present church building is solemnly dedicated to the Ascension of Our Lord. Doors opened to the whole community of Ikeja — a house of prayer for God and for His glory.',
  },
  {
    year: '2010',
    title: 'Parish Societies Flourish',
    tag: 'Community',
    description:
      'The parish grows to host over twenty societies and pious organisations, from the Legion of Mary to the Young Catholic Professionals.',
  },
  {
    year: '2024',
    title: 'Renovation Begins',
    tag: 'Growth',
    description:
      'A two-phase renovation of the church and parish grounds begins, sustained entirely by the generosity of parishioners.',
  },
];

export default function AboutPage(): React.JSX.Element {
  return (
    <div className={styles.about}>

      <PageHeader
        eyebrow="Our Parish"
        title="About Us"
        description="A community of faith, worship, and service in the heart of Ikeja, Lagos — gathered around the altar of the Ascended Lord."
        image="/images/hero-bg.png"
      />

      {/* ── History ──────────────────────────────────────────────────────── */}
      <section className={styles.about__history}>
        <div className={styles['about__history-aside']}>
          <div className={styles['about__history-heading']}>
            <p className={styles['about__history-eyebrow']}>Our History</p>
            <h2 className={styles['about__history-title']}>A House of Prayer in Ikeja</h2>
          </div>
          <div className={styles['about__history-emblem']} aria-hidden="true">
            <Image
              src="/icons/ascension_logo_dark.svg"
              alt=""
              width={280}
              height={280}
            />
          </div>
        </div>
        <div className={styles['about__history-prose']}>
          <p className={styles['about__history-lead']}>
            What began as a handful of the faithful gathering for Sunday Mass has grown, by God's
            grace, into one of the most vibrant parishes of the Archdiocese of Lagos.
          </p>
          <p className={styles['about__history-body']}>
            The Catholic Church of the Ascension began as a small chapel serving travellers and
            workers at the Murtala Muhammed International Airport, Ikeja. Today our parish family
            numbers in the thousands — drawn from every corner of Nigeria and beyond, reflecting the
            journeys that pass daily through this part of Lagos.
          </p>
          <p className={styles['about__history-body']}>
            We take our name from the Ascension of Our Lord — the mystery in which Christ, lifted
            up in glory, sends His Church into the world. That commission shapes everything we do:
            the liturgy we celebrate, the disciples we form, and the charity we practise.
          </p>
          <blockquote className={styles['about__history-scripture']}>
            <p className={styles['about__history-scripture-text']}>
              "God's love has been poured into our hearts through the Holy Spirit who has been given
              to us."
            </p>
            <cite className={styles['about__history-scripture-ref']}>Romans 5:5</cite>
          </blockquote>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className={styles.about__stats} aria-label="Parish statistics">
        {(
          [
            { value: '1962', label: 'Founded' },
            { value: '1,000+', label: 'Seats at Mass' },
            { value: '20+', label: 'Societies & Ministries' },
            { value: '1000s', label: 'Families Served' },
          ] as const
        ).map((stat) => (
          <div key={stat.label} className={styles['about__stat']}>
            <p className={styles['about__stat-value']}>{stat.value}</p>
            <p className={styles['about__stat-label']}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <section className={styles.about__mission} aria-label="Parish mission statement">
        <div className={styles['about__mission-inner']}>
          <blockquote className={styles['about__mission-quote']}>
            "To worship God in spirit and in truth, to form disciples of the Ascended Lord, and to
            serve every person who passes through our doors — for God and for His glory."
          </blockquote>
          <p className={styles['about__mission-attr']}>Parish Mission Statement</p>
        </div>
        <div className={styles['about__mission-watermark']} aria-hidden="true">
          <Image src="/icons/ascension_logo_light.svg" alt="" width={252} height={251} />
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <section className={styles.about__timeline}>
        <header className={styles['about__timeline-head']}>
          <p className={styles['about__timeline-eyebrow']}>Through the Years</p>
          <h2 className={styles['about__timeline-title']}>Key Milestones</h2>
        </header>
        <div className={styles['about__tl-track']}>
          <div className={styles['about__tl-axis']} aria-hidden="true" />
          {milestones.map((milestone, i) => (
            <div
              key={milestone.year}
              className={`${styles['about__tl-row']} ${
                i % 2 !== 0 ? styles['about__tl-row--flip'] : ''
              }`}
            >
              {/* Date side (desktop only) */}
              <div className={styles['about__tl-date-side']}>
                <div className={styles['about__tl-pill']}>
                  <span className={styles['about__tl-year']}>{milestone.year}</span>
                </div>
              </div>

              {/* Axis node */}
              <div className={styles['about__tl-node']} aria-hidden="true" />

              {/* Content side */}
              <div className={styles['about__tl-content-side']}>
                <p className={styles['about__tl-mobile-year']}>{milestone.year}</p>
                <div className={styles['about__tl-title-row']}>
                  <h3 className={styles['about__tl-item-title']}>{milestone.title}</h3>
                  <span className={styles['about__tl-tag']}>{milestone.tag}</span>
                </div>
                <div className={styles['about__tl-card']}>
                  <p className={styles['about__tl-text']}>{milestone.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Parish Life ──────────────────────────────────────────────────── */}
      <section className={styles['about__life']}>
        <header className={styles['about__life-head']}>
          <p className={styles['about__life-eyebrow']}>Parish Life</p>
          <h2 className={styles['about__life-title']}>One Family in Christ</h2>
        </header>
        <div className={styles['about__life-grid']}>
          {(
            [
              { src: '/images/gallery-1.jpg', caption: 'After Sunday Mass' },
              { src: '/images/gallery-2.jpg', caption: 'Feast Day Celebrations' },
              { src: '/images/gallery-3.jpg', caption: 'Societies & Ministries' },
            ] as const
          ).map(({ src, caption }) => (
            <div key={caption} className={styles['about__life-tile']}>
              <Image
                src={src}
                alt={caption}
                fill
                sizes="(min-width: 1280px) 415px, (min-width: 768px) 33vw, 100vw"
                className={styles['about__life-photo']}
              />
              <div className={styles['about__life-cap']}>
                <p className={styles['about__life-caption']}>{caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Card ─────────────────────────────────────────────────────── */}
      <div className={styles['about__cta']}>
        <div className={styles['about__cta-media']}>
          <Image
            src="/images/parish-family.jpg"
            alt="Parishioners gathered at the Church of the Ascension"
            fill
            sizes="(min-width: 1280px) 640px, (min-width: 768px) 50vw, 100vw"
            className={styles['about__cta-photo']}
          />
        </div>
        <div className={styles['about__cta-body']}>
          <div className={styles['about__cta-head']}>
            <p className={styles['about__cta-eyebrow']}>Get Involved</p>
            <h2 className={styles['about__cta-title']}>Become Part of the Family</h2>
          </div>
          <p className={styles['about__cta-desc']}>
            Whether you are new to the parish or returning after time away, there is a place for
            you at the table of the Lord.
          </p>
          <Link href="/contact" className={styles['about__cta-btn']}>
            Begin Your Journey →
          </Link>
        </div>
      </div>

    </div>
  );
}
