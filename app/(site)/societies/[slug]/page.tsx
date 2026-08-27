import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import Button from '@/components/ui/Button';
import { getSocieties, getSociety } from '@/lib/societies';
import { paragraphComponents } from '@/lib/portableText';
import SocietyHero from './SocietyHero';
import styles from './page.module.scss';

// ISR — revalidate every 10 minutes.
export const revalidate = 600;

interface SocietyRouteParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const societies = await getSocieties();
  return societies.map((society) => ({ slug: society.slug }));
}

export async function generateMetadata({ params }: SocietyRouteParams): Promise<Metadata> {
  const { slug } = await params;
  const society = await getSociety(slug);
  if (!society) return {};
  return {
    title: `${society.name} — Societies`,
    description:
      society.subtitle ?? `Learn more about ${society.name} at the Catholic Church of the Ascension.`,
  };
}

export default async function SocietyDetailPage({
  params,
}: SocietyRouteParams): Promise<React.JSX.Element> {
  const { slug } = await params;
  const society = await getSociety(slug);
  if (!society) notFound();

  const leaders = society.zoneLeader ?? [];
  const contacts = society.contact ?? [];

  return (
    <div className={styles.society}>
      <SocietyHero society={society} />

      <div className={styles['society__content']}>
        <div className={styles.body}>
          <div className={styles.body__main}>
            {society.description ? (
              <div className={styles.about}>
                <h2 className={styles.about__title}>About This Society</h2>
                <div className={styles.about__text}>
                  <PortableText
                    value={society.description}
                    components={paragraphComponents(styles.about__paragraph)}
                  />
                </div>
              </div>
            ) : null}

            {society.slogan ? (
              <div className={styles.slogan}>
                <div className={styles.slogan__icon} style={{ backgroundColor: society.color }}>
                  <Image src="/icons/slogan_icon.svg" alt="" width={45} height={45} />
                </div>
                <div className={styles.slogan__text}>
                  <p>{society.slogan.greeting}</p>
                  <p>{society.slogan.response}</p>
                </div>
              </div>
            ) : null}
          </div>

          <aside className={styles.sidebar} style={{ borderColor: society.color }}>
            <div className={styles.sidebar__header} style={{ borderColor: society.color }}>
              <div
                className={styles['sidebar__header-icon']}
                style={{ backgroundColor: society.color }}
              >
                <Image src="/icons/societyInfo_icon.svg" alt="" width={45} height={45} />
              </div>
              <div className={styles['sidebar__header-text']}>
                <p className={styles['sidebar__header-eyebrow']}>Society Details</p>
                <p className={styles['sidebar__header-title']}>Key Information</p>
              </div>
            </div>

            <div className={styles.sidebar__list}>
              {society.zonePatron ? (
                <div className={styles['sidebar__info-item']}>
                  <p className={styles['sidebar__info-label']}>Zone Patron</p>
                  <p className={styles['sidebar__info-value']}>{society.zonePatron}</p>
                </div>
              ) : null}
              {society.established ? (
                <div className={styles['sidebar__info-item']}>
                  <p className={styles['sidebar__info-label']}>Established</p>
                  <p className={styles['sidebar__info-value']}>{society.established}</p>
                </div>
              ) : null}
              {society.meetingDay ? (
                <div className={styles['sidebar__info-item']}>
                  <p className={styles['sidebar__info-label']}>Meeting Day</p>
                  <p className={styles['sidebar__info-value']}>{society.meetingDay}</p>
                </div>
              ) : null}
              {leaders.length > 0 ? (
                <div className={styles['sidebar__info-item']}>
                  <p className={styles['sidebar__info-label']}>Zone Leader</p>
                  {leaders.map((leader) => (
                    <p key={leader} className={styles['sidebar__info-value']}>
                      {leader}
                    </p>
                  ))}
                </div>
              ) : null}
              {contacts.length > 0 ? (
                <div className={styles['sidebar__info-item']}>
                  <p className={styles['sidebar__info-label']}>Contact</p>
                  {contacts.map((contact) => (
                    <p key={contact} className={styles['sidebar__info-value']}>
                      {contact}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>

            <div className={styles.sidebar__cta} style={{ borderColor: society.color }}>
              <Button href="/contact" variant="outline" size="sm">
                Get Involved Today
              </Button>
            </div>
          </aside>
        </div>

        <section className={styles.cta}>
          <div className={styles.cta__content}>
            <p className={styles.cta__eyebrow}>Our Parish Family</p>
            <h2 className={styles.cta__title}>Discover the Life of Our Parish</h2>
            <p className={styles.cta__text}>
              Every society is a thread in the life of Ascension Parish. Learn more about our
              history, our mission, and the many ways our community comes together in faith and
              service.
            </p>
            <Button href="/about" variant="primary" size="lg">
              Learn More About Us
            </Button>
          </div>
          <div className={styles.cta__image}>
            <Image
              src="/images/church_w_logo.png"
              alt="Catholic Church of the Ascension building"
              fill
              sizes="(min-width: 768px) 400px, 100vw"
              className={styles['cta__image-img']}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
