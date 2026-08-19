import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getSiteSettings } from '@/lib/site';
import styles from './layout.module.scss';

export default async function SiteLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<React.JSX.Element> {
  const siteSettings = await getSiteSettings();

  return (
    <>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
