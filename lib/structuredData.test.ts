import { describe, it, expect } from 'vitest';
import { SITE_URL } from './siteUrl';
import { breadcrumbLd, contactPageLd, parishOrganizationLd, webSiteLd } from './structuredData';
import type { SiteSettings } from './types';

// JSON-LD nodes cross-reference each other by `@id` (#parish, #website). These
// tests lock down that graph and the omit-when-empty behaviour, which keeps
// blank Sanity fields from emitting invalid empty values to search engines.

const PARISH_ID = `${SITE_URL}/#parish`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const full: SiteSettings = {
  parishName: 'Catholic Church of the Ascension',
  shortName: 'Ascension Ikeja',
  location: 'MMIA, Ikeja',
  address: 'Murtala Muhammed International Airport, Ikeja, Lagos',
  phone: '+234 800 000 0000',
  email: 'info@example.org',
  facebookUrl: 'https://facebook.com/ascension',
  instagramUrl: 'https://instagram.com/ascension',
  youtubeChannelId: 'UC123',
  streetAddress: 'MMIA Road',
  addressLocality: 'Ikeja',
  addressRegion: 'Lagos',
  postalCode: '100001',
  addressCountry: 'NG',
  latitude: 6.58,
  longitude: 3.32,
  logo: 'https://cdn.sanity.io/images/p3p9t4z1/production/logo.png',
  foundingYear: '1985',
  diocese: 'Archdiocese of Lagos',
};

const sparse: SiteSettings = {
  ...full,
  shortName: '',
  phone: '',
  email: '',
  facebookUrl: '',
  instagramUrl: '',
  youtubeChannelId: '',
  streetAddress: '',
  addressLocality: '',
  addressRegion: '',
  postalCode: undefined,
  addressCountry: '',
  latitude: undefined,
  longitude: undefined,
  logo: null,
  foundingYear: undefined,
  diocese: '',
};

describe('parishOrganizationLd', () => {
  it('builds the full parish node', () => {
    const ld = parishOrganizationLd(full);
    expect(ld).toMatchObject({
      '@type': ['Church', 'PlaceOfWorship'],
      '@id': PARISH_ID,
      url: SITE_URL,
      alternateName: 'Ascension Ikeja',
      geo: { '@type': 'GeoCoordinates', latitude: 6.58, longitude: 3.32 },
      foundingDate: '1985',
      parentOrganization: { '@type': 'Organization', name: 'Archdiocese of Lagos' },
      sameAs: [
        'https://facebook.com/ascension',
        'https://instagram.com/ascension',
        'https://www.youtube.com/channel/UC123',
      ],
    });
  });

  it('omits empty optional fields and defaults the country to NG', () => {
    const ld = parishOrganizationLd(sparse);
    for (const key of [
      'alternateName',
      'logo',
      'telephone',
      'email',
      'geo',
      'foundingDate',
      'parentOrganization',
      'sameAs',
    ]) {
      expect(ld).not.toHaveProperty(key);
    }
    expect(ld.address).toEqual({ '@type': 'PostalAddress', addressCountry: 'NG' });
  });

  it('omits geo unless both coordinates are present', () => {
    expect(parishOrganizationLd({ ...full, longitude: undefined })).not.toHaveProperty('geo');
  });
});

describe('webSiteLd', () => {
  it('is published by the parish node', () => {
    expect(webSiteLd(full)).toMatchObject({
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE_URL,
      publisher: { '@id': PARISH_ID },
    });
  });
});

describe('breadcrumbLd', () => {
  it('numbers items from 1 and makes paths absolute', () => {
    const ld = breadcrumbLd([
      { name: 'Home', path: '/' },
      { name: 'Gallery', path: '/gallery' },
      { name: 'Harvest 2025', path: '/gallery/harvest-2025' },
    ]);
    expect(ld.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Gallery', item: `${SITE_URL}/gallery` },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Harvest 2025',
        item: `${SITE_URL}/gallery/harvest-2025`,
      },
    ]);
  });
});

describe('contactPageLd', () => {
  it('ties the contact page back to the parish and website nodes', () => {
    expect(contactPageLd()).toMatchObject({
      '@type': 'ContactPage',
      url: `${SITE_URL}/contact`,
      about: { '@id': PARISH_ID },
      isPartOf: { '@id': WEBSITE_ID },
    });
  });
});
