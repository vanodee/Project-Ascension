import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Cinzel, Lora } from 'next/font/google';
import { getSiteSettings } from '@/lib/site';
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
  return {
    title: {
      default: `${siteSettings.parishName} - ${siteSettings.location}`,
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
