import { client } from '@/sanity/lib/client';
import { DONATION_CATEGORIES_QUERY } from '@/sanity/lib/queries';
import type { DonationCategory } from './types';

export async function getDonationCategories(): Promise<DonationCategory[]> {
  return client.fetch<DonationCategory[]>(DONATION_CATEGORIES_QUERY);
}
