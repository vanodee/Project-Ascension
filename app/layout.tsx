import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cinzel, Lora } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getSiteSettings } from '@/lib/site';
import { SITE_URL } from '@/lib/siteUrl';
import { DEFAULT_OG_ALT, DEFAULT_OG_IMAGE } from '@/lib/metadata';
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

export const viewport: Viewport = {
  themeColor: '#2f210f',
  colorScheme: 'light',
};

// Site-wide defaults. Every page overrides `title`, `alternates.canonical`,
// `openGraph`, and `twitter` via `buildPageMetadata` (lib/metadata.ts); the
// blocks here are the baseline for any route that does not (e.g. not-found).
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
    authors: [{ name: siteSettings.parishName }],
    publisher: siteSettings.diocese,
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
      type: 'website',
      siteName: siteSettings.parishName,
      locale: 'en_NG',
      description,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: DEFAULT_OG_ALT }],
    },
    twitter: {
      card: 'summary_large_image',
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): React.JSX.Element {
  return (
    <html lang="en-NG" data-scroll-behavior="smooth" className={`${cinzel.variable} ${lora.variable}`}>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
