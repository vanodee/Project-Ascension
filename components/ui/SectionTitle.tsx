import type { ReactNode } from 'react';
import styles from './SectionTitle.module.scss';

interface SectionTitleProps {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  inverse?: boolean;
  underlined?: boolean;
}

export default function SectionTitle({
  eyebrow,
  title,
  action,
  inverse = false,
  underlined = false,
}: SectionTitleProps): React.JSX.Element {
  const classNames = [
    styles['section-title'],
    inverse ? styles['section-title--inverse'] : '',
    underlined ? styles['section-title--underlined'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={classNames}>
      <div className={styles['section-title__text']}>
        <p className={styles['section-title__eyebrow']}>{eyebrow}</p>
        <h2 className={styles['section-title__heading']}>{title}</h2>
      </div>
      {action ? <div className={styles['section-title__action']}>{action}</div> : null}
    </header>
  );
}
