'use client';

// Error boundary for every (site) page. Renders inside the site layout, so the
// header and footer stay in place. Next 16 passes `retry` (formerly `reset`).

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import styles from './error.module.scss';

export default function SiteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}): React.JSX.Element {
  useEffect(() => {
    console.error('[site] render error:', error);
  }, [error]);

  return (
    <div className={styles.error}>
      <p className={styles.error__eyebrow}>Something went wrong</p>
      <h1 className={styles.error__title}>We couldn&rsquo;t load this page</h1>
      <p className={styles.error__text}>
        This is usually temporary. Please try again in a moment — if it keeps
        happening, let the parish office know.
      </p>
      <div className={styles.error__actions}>
        <Button type="button" onClick={retry}>
          Try again
        </Button>
        <Button href="/" variant="outline">
          Return to homepage
        </Button>
      </div>
    </div>
  );
}
