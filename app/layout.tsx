import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Cinzel, Lora } from 'next/font/google';
import { getSiteSettings } from '@/lib/site';
import { SITE_URL } from '@/lib/siteUrl';
import '@/styles/globals.scss';

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

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  const description =
    'A community of faith, worship, and service in the heart of Ikeja, Lagos. A parish of the Catholic Archdiocese of Lagos.';
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${siteSettings.parishName} - ${siteSettings.location}`,
      template: `%s | ${siteSettings.parishName}`,
    },
    description,
    applicationName: siteSettings.parishName,
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: siteSettings.parishName,
      description:
        'A community of faith, worship, and service in the heart of Ikeja, Lagos.',
      url: '/',
      siteName: siteSettings.parishName,
      type: 'website',
      locale: 'en_NG',
      images: [{ url: '/images/church_w_logo.png', width: 500, height: 500 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteSettings.parishName,
      description:
        'A community of faith, worship, and service in the heart of Ikeja, Lagos.',
      images: ['/images/church_w_logo.png'],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): React.JSX.Element {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cinzel.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
