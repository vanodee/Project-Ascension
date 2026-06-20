import styles from './PageHeader.module.scss';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

/**
 * Standard inner-page header. Pages without a dedicated Figma frame use this
 * pattern, built from the design system's Label/Heading/Body styles.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps): React.JSX.Element {
  return (
    <header className={styles['page-header']}>
      <p className={styles['page-header__eyebrow']}>{eyebrow}</p>
      <h1 className={styles['page-header__title']}>{title}</h1>
      {description ? (
        <p className={styles['page-header__description']}>{description}</p>
      ) : null}
    </header>
  );
}
