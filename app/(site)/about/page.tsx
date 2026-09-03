import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import PageHeader from '@/components/ui/PageHeader';
import { getAboutPage } from '@/lib/about';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'The history and mission of the Catholic Church of the Ascension, MMIA, Ikeja, Lagos — a parish of the Catholic Archdiocese of Lagos.',
};

export default async function AboutPage(): Promise<React.JSX.Element> {
  const aboutPage = await getAboutPage();

  return (
    <div className={styles.about}>

      <PageHeader
        eyebrow="Our Parish"
        title="About Us"
        description="A community of faith, worship, and service in the heart of Ikeja, Lagos — gathered around the altar of the Ascended Lord."
      />

      <div className={styles.about__content}>
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
            <PortableText
              value={aboutPage.body}
              components={{
                block: {
                  normal: ({ children, index }) => (
                    <p
                      className={
                        index === 0
                          ? styles['about__history-lead']
                          : styles['about__history-body']
                      }
                    >
                      {children}
                    </p>
                  ),
                },
              }}
            />
            {aboutPage.scriptureQuote ? (
              <blockquote className={styles['about__history-scripture']}>
                <p className={styles['about__history-scripture-text']}>
                  &ldquo;{aboutPage.scriptureQuote.text}&rdquo;
                </p>
                <cite className={styles['about__history-scripture-ref']}>
                  {aboutPage.scriptureQuote.reference}
                </cite>
              </blockquote>
            ) : null}
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        {aboutPage.stats.length > 0 ? (
          <div className={styles.about__stats} aria-label="Parish statistics">
            {aboutPage.stats.map((stat) => (
              <div key={stat._key} className={styles['about__stat']}>
                <p className={styles['about__stat-value']}>{stat.value}</p>
                <p className={styles['about__stat-label']}>{stat.label}</p>
              </div>
            ))}
          </div>
        ) : null}

        {/* ── Mission ──────────────────────────────────────────────────────── */}
        <section className={styles.about__mission} aria-label="Parish mission statement">
          <div className={styles['about__mission-inner']}>
            <blockquote className={styles['about__mission-quote']}>
              &ldquo;{aboutPage.missionStatement}&rdquo;
            </blockquote>
            <p className={styles['about__mission-attr']}>Parish Mission Statement</p>
          </div>
          <div className={styles['about__mission-watermark']} aria-hidden="true">
            <Image src="/icons/ascension_logo_light.svg" alt="" width={252} height={251} />
          </div>
        </section>

        {/* ── Timeline ─────────────────────────────────────────────────────── */}
        {aboutPage.milestones.length > 0 ? (
          <section className={styles.about__timeline}>
            <header className={styles['about__timeline-head']}>
              <p className={styles['about__timeline-eyebrow']}>Through the Years</p>
              <h2 className={styles['about__timeline-title']}>Key Milestones</h2>
            </header>
            <div className={styles['about__tl-track']}>
              <div className={styles['about__tl-axis']} aria-hidden="true" />
              {aboutPage.milestones.map((milestone, i) => (
                <div
                  key={milestone._key}
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
        ) : null}

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
    </div>
  );
}
