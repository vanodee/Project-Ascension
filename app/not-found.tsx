import type { Metadata } from 'next';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import styles from './not-found.module.scss';

// Root not-found — also the catch-all for unmatched URLs. Rendered inside the
// root layout only (no site header/footer) per design.

export const metadata: Metadata = {
  title: 'Page Not Found',
};

export default function NotFound(): React.JSX.Element {
  return (
    <main className={styles['not-found']}>
      <div className={styles['not-found__inner']}>
        <Image
          src="/icons/ascension_logo_dark.svg"
          alt="Catholic Church of the Ascension"
          width={96}
          height={96}
          className={styles['not-found__logo']}
        />
        <p className={styles['not-found__code']}>404</p>
        <h1 className={styles['not-found__title']}>This page could not be found</h1>
        <p className={styles['not-found__text']}>
          The page you are looking for may have been moved, renamed, or never existed.
        </p>
        <div className={styles['not-found__action']}>
          <Button href="/">Return to homepage</Button>
        </div>
      </div>
    </main>
  );
}
