import styles from './TallyEmbed.module.scss';

interface TallyEmbedProps {
  formId: string;
  title: string;
}

/**
 * Tally.so form embed. While the form ID is a mock placeholder, a styled
 * stand-in is shown; once a real Tally form ID is configured this renders
 * the live embed iframe.
 */
export default function TallyEmbed({ formId, title }: TallyEmbedProps): React.JSX.Element {
  const isMock = formId.startsWith('mock-');

  if (isMock) {
    return (
      <div className={styles['tally-embed']}>
        <p className={styles['tally-embed__label']}>Enquiry Form</p>
        <p className={styles['tally-embed__note']}>
          The {title} form will appear here once the parish Tally.so form is connected.
          In the meantime, please contact the parish office directly.
        </p>
      </div>
    );
  }

  return (
    <iframe
      src={`https://tally.so/embed/${formId}?hideTitle=1&transparentBackground=1`}
      title={title}
      className={styles['tally-embed__iframe']}
      loading="lazy"
    />
  );
}
