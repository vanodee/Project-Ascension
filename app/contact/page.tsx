import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import TallyEmbed from '@/components/ui/TallyEmbed';
import { siteSettings } from '@/lib/site';
import styles from './page.module.scss';

// SSG — contact details change infrequently, managed in Sanity (siteSettings).

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact the Catholic Church of the Ascension, MMIA, Ikeja, Lagos — address, phone, email, Mass schedule, and contact form.',
};

export default function ContactPage(): React.JSX.Element {
  return (
    <div className={styles.contact}>
      <PageHeader
        eyebrow="We Would Love to Hear From You"
        title="Contact Us"
        description="Reach the parish office for enquiries, sacramental requests, or to volunteer."
      />

      <div className={styles.contact__columns}>
        <section className={styles.contact__details} aria-label="Parish contact details">
          <div className={styles.contact__block}>
            <p className={styles['contact__block-label']}>Address</p>
            <p className={styles['contact__block-value']}>{siteSettings.address}</p>
          </div>
          <div className={styles.contact__block}>
            <p className={styles['contact__block-label']}>Phone</p>
            <p className={styles['contact__block-value']}>
              <a href={`tel:${siteSettings.phone.replace(/\s/g, '')}`}>{siteSettings.phone}</a>
            </p>
          </div>
          <div className={styles.contact__block}>
            <p className={styles['contact__block-label']}>Email</p>
            <p className={styles['contact__block-value']}>
              <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>
            </p>
          </div>

          <div className={styles.contact__block}>
            <p className={styles['contact__block-label']}>Mass Schedule</p>
            {siteSettings.massTimes
              .filter((group) => group.heading !== 'Location')
              .map((group) => (
                <div key={group.heading} className={styles['contact__mass-group']}>
                  <p className={styles['contact__mass-heading']}>{group.heading}</p>
                  {group.times.map((time) => (
                    <p key={time} className={styles['contact__block-value']}>
                      {time}
                    </p>
                  ))}
                </div>
              ))}
          </div>
        </section>

        <section className={styles.contact__form} aria-label="Contact form">
          <h2 className={styles['contact__form-title']}>Send a Message</h2>
          <TallyEmbed formId="mock-contact-form" title="Contact the Parish" />
        </section>
      </div>

      <section className={styles.contact__map} aria-label="Map to the parish">
        <iframe
          title="Map to the Catholic Church of the Ascension, MMIA, Ikeja, Lagos"
          src="https://www.google.com/maps?q=Catholic+Church+of+the+Ascension+MMIA+Ikeja+Lagos&output=embed"
          className={styles['contact__map-frame']}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </div>
  );
}
