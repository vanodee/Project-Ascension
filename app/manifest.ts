import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Catholic Church of the Ascension, Ikeja, Lagos',
    short_name: 'Ascension Parish, Ikeja, Lagos',
    description:
      'A community of faith, worship, and service in the heart of Ikeja, Lagos.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    lang: 'en-NG',
    dir: 'ltr',
    categories: ['religion'],
    background_color: '#f8f2e9',
    theme_color: '#2f210f',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
