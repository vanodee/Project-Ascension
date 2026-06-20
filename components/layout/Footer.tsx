import Link from 'next/link';
import Image from 'next/image';
import { siteSettings } from '@/lib/site';
import styles from './Footer.module.scss';

interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

interface FooterGroup {
  heading: string;
  links: FooterLink[];
}

const LINK_GROUPS: FooterGroup[] = [
  {
    heading: 'Parish',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/clergy', label: 'Our Clergy' },
      { href: '/sacraments', label: 'Sacraments' },
      { href: '/sacraments/rcia', label: 'Becoming Catholic' },
      { href: '/gallery', label: 'Gallery' },
    ],
  },
  {
    heading: 'Worship',
    links: [
      { href: '/readings', label: 'Daily Readings' },
      { href: '/schedule', label: 'Mass Schedule' },
      { href: '/homilies', label: 'Homilies' },
      { href: '/livestream', label: 'Watch Live' },
      { href: '/announcements', label: 'Announcements' },
    ],
  },
  {
    heading: 'Connect',
    links: [
      { href: '/contact', label: 'Contact Us' },
      { href: '/give', label: 'Give Online' },
      { href: '/sacraments/rcia', label: 'RCIA Enquiry' },
      { href: siteSettings.facebookUrl, label: 'Facebook', external: true },
      { href: siteSettings.instagramUrl, label: 'Instagram', external: true },
    ],
  },
];

export default function Footer(): React.JSX.Element {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer__main}>
        <div className={styles.footer__identity}>
          <div className={styles['footer__logo-row']}>
            <Image
              src="/icons/ascension_logo_dark.svg"
              alt="Catholic Church of the Ascension logo"
              width={190}
              height={189}
              className={styles.footer__logo}
            />
            <div className={styles.footer__name}>
              <p className={styles['footer__name-small']}>Catholic Church of the</p>
              <p className={styles['footer__name-large']}>Ascension</p>
              <p className={styles['footer__name-small']}>{siteSettings.location}</p>
            </div>
          </div>
          <p className={styles.footer__summary}>
            A parish of the Catholic Archdiocese of Lagos, committed to worship, formation,
            and service in the spirit of the Ascended Lord.
          </p>
        </div>

        <div className={styles['footer__link-groups']}>
          {LINK_GROUPS.map((group) => (
            <div key={group.heading} className={styles['footer__link-group']}>
              <p className={styles['footer__group-heading']}>{group.heading}</p>
              {group.links.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className={styles.footer__link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} href={link.href} className={styles.footer__link}>
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer__wordmark}>
        <Image
          src="/images/footer-wordmark.svg"
          alt=""
          width={1350}
          height={227}
          className={styles['footer__wordmark-image']}
        />
      </div>
    </footer>
  );
}
