import type { SiteSettings } from './types';

// Mirrors the `siteSettings` singleton in Sanity. Mocked until the CMS is wired up.
export const siteSettings: SiteSettings = {
  parishName: 'Catholic Church of the Ascension',
  shortName: 'Ascension',
  location: 'MMIA, Ikeja, Lagos.',
  address: 'Murtala Muhammed International Airport Road, Ikeja, Lagos, Nigeria',
  phone: '+234 801 234 5678',
  email: 'info@ascensioncatholicikeja.org',
  facebookUrl: 'https://facebook.com/ascensioncatholicikeja',
  instagramUrl: 'https://instagram.com/ascensioncatholicikeja',
  youtubeChannelId: 'UCascensionikeja',
  massTimes: [
    {
      heading: "This Sunday's Masses",
      times: ['7:00 am • First Mass', '9:00 am • Second Mass'],
      note: 'First Mass begins at the Chapel',
    },
    {
      heading: 'Masses This Week',
      times: ['7:00 am • Monday – Saturday', '12:00 pm • Monday – Saturday'],
      note: 'First Mass begins at the Chapel',
    },
    {
      heading: 'Confession',
      times: ['4:00 pm • Saturdays'],
      note: 'And by appointment with any priest',
    },
    {
      heading: 'Location',
      times: ['MMIA, Ikeja, Lagos.'],
      note: 'Near the International Airport main gate',
    },
  ],
};
