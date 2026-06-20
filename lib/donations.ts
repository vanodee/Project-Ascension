import type { DonationCategory } from './types';

// Mirrors the `donationCategory` config list in Sanity. Mocked until the CMS is wired up.
export const donationCategories: DonationCategory[] = [
  {
    id: 'general-offering',
    label: 'General Offering',
    description: 'Supports the day-to-day life and ministry of the parish.',
  },
  {
    id: 'building-fund',
    label: 'Building Fund',
    description: 'Funds the ongoing renovation and expansion of the church buildings.',
  },
  {
    id: 'charity',
    label: 'Charity & Outreach',
    description: 'Feeds and supports the poor through the Society of St. Vincent de Paul.',
  },
  {
    id: 'thanksgiving',
    label: 'Thanksgiving',
    description: 'An offering of gratitude for blessings received.',
  },
  {
    id: 'mass-intentions',
    label: 'Mass Intentions',
    description: 'Offerings for Masses to be said for your intentions.',
  },
];
