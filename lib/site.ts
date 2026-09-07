import type { SanityImageSource } from '@sanity/image-url';
import { client } from '@/sanity/lib/client';
import { imageUrl } from '@/sanity/lib/image';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import type { SiteSettings } from './types';

// Fetched in the root (site) layout, so it runs on every single page render.
// A transient Sanity/network blip here would otherwise take the whole site down
// (every route, including error pages, is nested under this layout), so we fall
// back to a known-good snapshot rather than letting the fetch failure propagate.
const FALLBACK_SITE_SETTINGS: SiteSettings = {
  parishName: 'Catholic Church of the Ascension',
  shortName: 'Ascension',
  location: 'MMIA, Ikeja, Lagos.',
  address: 'Murtala Muhammed International Airport Road, Ikeja, Lagos, Nigeria',
  phone: '+234 801 234 5678',
  email: 'info@ascensioncatholicikeja.org',
  facebookUrl: 'https://facebook.com/ascensioncatholicikeja',
  instagramUrl: 'https://instagram.com/ascensioncatholicikeja',
  youtubeChannelId: 'UCascensionikeja',
  // Approximate — the parish should set exact values in Studio (Site Settings).
  streetAddress: 'Murtala Muhammed International Airport Road',
  addressLocality: 'Ikeja',
  addressRegion: 'Lagos',
  postalCode: '100102',
  addressCountry: 'NG',
  latitude: 6.5774,
  longitude: 3.3213,
  logo: null,
  diocese: 'Catholic Archdiocese of Lagos',
};

// Raw document shape: `logo` is an unresolved Sanity image (or null) until we
// turn it into a CDN URL below; everything else matches SiteSettings 1:1.
type SiteSettingsDoc = Omit<SiteSettings, 'logo'> & { logo: SanityImageSource | null };

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const doc = await client.fetch<SiteSettingsDoc>(SITE_SETTINGS_QUERY);
    return { ...doc, logo: doc.logo ? imageUrl(doc.logo, 512) : null };
  } catch (err) {
    console.error('getSiteSettings: falling back to cached site settings —', err);
    return FALLBACK_SITE_SETTINGS;
  }
}
