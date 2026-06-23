'use client';

import { useEffect } from 'react';
import styles from './TallyEmbed.module.scss';

interface TallyEmbedProps {
  formId: string;
  title: string;
}

export default function TallyEmbed({ formId, title }: TallyEmbedProps): React.JSX.Element {
  const isMock = formId.startsWith('mock-');

  useEffect(() => {
    if (isMock) return;
    if (document.querySelector('script[src="https://tally.so/widgets/embed.js"]')) return;
    const script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.async = true;
    document.body.appendChild(script);
  }, [isMock]);

  if (isMock) {
    return (
      <div className={`${styles['tally-embed']} ${styles['tally-embed--mock']}`}>
        <p className={styles['tally-embed__label']}>Enquiry Form</p>
        <p className={styles['tally-embed__note']}>
          The {title} form will appear here once the parish Tally.so form is connected.
          In the meantime, please contact the parish office directly.
        </p>
      </div>
    );
  }

  return (
    <div className={styles['tally-embed']}>
      <iframe
        src={`https://tally.so/embed/${formId}?hideTitle=1&transparentBackground=1&dynamicHeight=1`}
        title={title}
        className={styles['tally-embed__iframe']}
        loading="lazy"
      />
    </div>
  );
}
