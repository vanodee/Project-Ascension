import type { Metadata } from 'next';
import Image from 'next/image';
import PageHeader from '@/components/ui/PageHeader';
import styles from './page.module.scss';

// SSG — content changes infrequently, managed in Sanity (aboutPage singleton).

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'The history and mission of the Catholic Church of the Ascension, MMIA, Ikeja, Lagos — a parish of the Catholic Archdiocese of Lagos.',
};

interface Milestone {
  year: string;
  title: string;
  description: string;
}

// Mirrors the `aboutPage` singleton in Sanity. Mocked until the CMS is wired up.
const milestones: Milestone[] = [
  {
    year: '1962',
    title: 'A Chapel at the Airport',
    description:
      'A small chapel is established to serve Catholic travellers and workers at the Lagos international airport, with Mass said by visiting priests.',
  },
  {
    year: '1978',
    title: 'Parish Erected',
    description:
      'The chaplaincy is formally erected as a parish of the Archdiocese of Lagos under the title of the Ascension of the Lord.',
  },
  {
    year: '1994',
    title: 'The Present Church',
    description:
      'The present church building is dedicated, with seating for over one thousand worshippers.',
  },
  {
    year: '2010',
    title: 'Parish Societies Flourish',
    description:
      'The parish grows to host over twenty societies and pious organisations, from the Legion of Mary to the Young Catholic Professionals.',
  },
  {
    year: '2024',
    title: 'Renovation Begins',
    description:
      'A two-phase renovation of the church and parish grounds begins, sustained entirely by the generosity of parishioners.',
  },
];

const narrative: string[] = [
  'The Catholic Church of the Ascension began as a small chapel serving travellers and workers at the Murtala Muhammed International Airport, Ikeja. What started as a handful of faithful gathering for Sunday Mass has grown, by God’s grace, into one of the most vibrant parishes of the Catholic Archdiocese of Lagos.',
  'Our parish family today numbers in the thousands — drawn from every corner of Nigeria and beyond, reflecting the journeys that pass daily through this part of Lagos. We are a community of worship, formation, and service: celebrating the sacraments with reverence, forming disciples of every age, and serving the poor at our gates.',
  'The parish takes its name from the Ascension of Our Lord — the mystery in which Christ, lifted up in glory, sends His Church into the world. That commission shapes everything we do: from the liturgy we celebrate to the charity we practise.',
];

export default function AboutPage(): React.JSX.Element {
  return (
    <div className={styles.about}>
      <PageHeader
        eyebrow="Our Parish"
        title="About Us"
        description="The story of the Catholic Church of the Ascension — past, present, and the mission that carries us forward."
      />

      <div className={styles.about__hero}>
        <Image
          src="/images/hero-bg.png"
          alt="Interior of the Catholic Church of the Ascension"
          fill
          sizes="(min-width: 1400px) 1400px, 100vw"
          className={styles['about__hero-image']}
        />
      </div>

      <section className={styles.about__narrative}>
        <p className={styles.about__eyebrow}>Our History</p>
        {narrative.map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className={styles.about__paragraph}>
            {paragraph}
          </p>
        ))}
      </section>

      <section className={styles.about__mission} aria-label="Parish mission statement">
        <blockquote className={styles.about__quote}>
          “To worship God in spirit and in truth, to form disciples of the Ascended Lord,
          and to serve every person who passes through our doors — for God and for His
          glory.”
        </blockquote>
        <p className={styles['about__quote-attribution']}>Parish Mission Statement</p>
      </section>

      <section className={styles.about__milestones}>
        <p className={styles.about__eyebrow}>Key Milestones</p>
        <div className={styles.about__timeline}>
          {milestones.map((milestone) => (
            <div key={milestone.year} className={styles['about__timeline-item']}>
              <p className={styles['about__timeline-year']}>{milestone.year}</p>
              <div className={styles['about__timeline-body']}>
                <h3 className={styles['about__timeline-title']}>{milestone.title}</h3>
                <p className={styles['about__timeline-text']}>{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
