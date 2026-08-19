import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import type { SiteSettings } from './types';

export async function getSiteSettings(): Promise<SiteSettings> {
  return client.fetch<SiteSettings>(SITE_SETTINGS_QUERY);
}
