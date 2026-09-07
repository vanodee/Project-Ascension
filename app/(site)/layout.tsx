import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { getSiteSettings } from '@/lib/site';
import { parishOrganizationLd, webSiteLd } from '@/lib/structuredData';
import styles from './layout.module.scss';

export default async function SiteLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<React.JSX.Element> {
  const siteSettings = await getSiteSettings();

  return (
    <>
      <JsonLd data={[webSiteLd(siteSettings), parishOrganizationLd(siteSettings)]} />
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
