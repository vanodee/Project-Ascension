import { client } from '@/sanity/lib/client';
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
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    return await client.fetch<SiteSettings>(SITE_SETTINGS_QUERY);
  } catch (err) {
    console.error('getSiteSettings: falling back to cached site settings —', err);
    return FALLBACK_SITE_SETTINGS;
  }
}
