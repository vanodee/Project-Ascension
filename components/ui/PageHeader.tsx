import Image from 'next/image';
import styles from './PageHeader.module.scss';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  image?: string;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  image = '/images/hero-bg.png',
}: PageHeaderProps): React.JSX.Element {
  return (
    <header className={styles['page-header']}>
      <Image
        src={image}
        alt=""
        fill
        sizes="(min-width: 1400px) 1400px, 100vw"
        className={styles['page-header__img']}
        priority
      />
      <div className={styles['page-header__scrim']} aria-hidden="true" />
      <div className={styles['page-header__content']}>
        <p className={styles['page-header__eyebrow']}>{eyebrow}</p>
        <h1 className={styles['page-header__title']}>{title}</h1>
        {description ? (
          <p className={styles['page-header__description']}>{description}</p>
        ) : null}
      </div>
    </header>
  );
}
