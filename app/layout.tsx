import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Cinzel, Lora } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { siteSettings } from '@/lib/site';
import '@/styles/globals.scss';
import styles from './layout.module.scss';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-cinzel',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${siteSettings.parishName} — ${siteSettings.location}`,
    template: `%s | ${siteSettings.parishName}`,
  },
  description:
    'A community of faith, worship, and service in the heart of Ikeja, Lagos. A parish of the Catholic Archdiocese of Lagos.',
  openGraph: {
    title: siteSettings.parishName,
    description:
      'A community of faith, worship, and service in the heart of Ikeja, Lagos.',
    type: 'website',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteSettings.parishName,
    description:
      'A community of faith, worship, and service in the heart of Ikeja, Lagos.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): React.JSX.Element {
  return (
    <html lang="en" className={`${cinzel.variable} ${lora.variable}`}>
      <body>
        <Header />
        <main className={styles.main}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
