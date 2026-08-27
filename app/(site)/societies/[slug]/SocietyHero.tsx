import Image from 'next/image';
import type { SocietyDetail } from '@/lib/types';
import styles from './SocietyHero.module.scss';

interface SocietyHeroProps {
  society: SocietyDetail;
}

export default function SocietyHero({ society }: SocietyHeroProps): React.JSX.Element {
  return (
    <div className={styles.hero}>
      <div className={styles.hero__logo} style={{ backgroundColor: society.color }}>
        <Image
          src={society.logo}
          alt=""
          fill
          sizes="(min-width: 768px) 40vw, 100vw"
          className={styles['hero__logo-img']}
        />
      </div>
      <div className={styles.hero__info}>
        <p className={styles.hero__eyebrow}>Catholic Church of the Ascension</p>
        <h1 className={styles.hero__title}>{society.name}</h1>
        {society.subtitle ? <p className={styles.hero__subtitle}>{society.subtitle}</p> : null}
      </div>
    </div>
  );
}
