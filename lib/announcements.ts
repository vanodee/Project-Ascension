import type { Announcement } from './types';

// Mirrors the `announcement` collection in Sanity. Mocked until the CMS is wired up.
const announcements: Announcement[] = [
  {
    slug: 'ascension-family-prayer',
    title: 'Ascension Family Prayer',
    excerpt:
      'Join us for a special evening of Eucharistic Adoration, praise and worship.',
    body: [
      'The parish invites every family to an evening of Eucharistic Adoration, praise, and worship in the main church building. The evening will open with the Rosary, followed by exposition of the Blessed Sacrament and Benediction.',
      'Families are encouraged to come together — parents, children, and grandparents alike. Booklets with the order of prayer will be provided at the entrance.',
      'Light refreshments will be served afterwards at the parish hall. For enquiries, contact the parish office during the week.',
    ],
    publishedAt: '2026-05-10T09:00:00+01:00',
    pinned: true,
    category: 'liturgy',
    image: '/images/gospel-photo.png',
    eventDate: '2026-05-17T19:00:00+01:00',
    eventLocation: 'Main Church Building',
  },
  {
    slug: 'youth-congress-registration',
    title: 'Youth Congress Registration Open',
    excerpt:
      'Parishioners aged 16–35 are invited to register for the Annual Archdiocesan Youth Congress holding on June 14th.',
    body: [
      'Parishioners aged 16–35 are invited to register for the Annual Archdiocesan Youth Congress holding on June 14th at the Holy Cross Cathedral, Lagos.',
      'Registration forms are available at the parish office and from the youth chaplaincy after every Sunday Mass. Registration closes on June 7th.',
      'Transportation will be arranged by the parish for all registered participants. The congress theme this year is “Behold, I Make All Things New” (Rev 21:5).',
    ],
    publishedAt: '2026-05-18T09:00:00+01:00',
    pinned: false,
    category: 'youth',
    image: '/images/announcement-1.png',
    eventDate: '2026-06-14T08:00:00+01:00',
    eventLocation: 'Holy Cross Cathedral, Lagos',
  },
  {
    slug: 'building-fund-drive',
    title: 'Building Fund Contribution Drive',
    excerpt:
      'The second phase of the church renovation begins next month. Parishioners are encouraged to contribute generously to the Building Fund.',
    body: [
      'The second phase of the church renovation begins next month, covering the roofing of the new chapel wing and the resurfacing of the parish car park.',
      'Parishioners are encouraged to contribute generously to the Building Fund. Contributions can be made online through the Give page, at the offertory during Mass, or directly at the parish office.',
      'The Parish Finance Council will publish a progress report at the end of each month. We thank you for your continued generosity.',
    ],
    publishedAt: '2026-05-25T09:00:00+01:00',
    pinned: false,
    category: 'general',
    image: '/images/announcement-2.png',
  },
  {
    slug: 'rcia-new-cohort',
    title: 'RCIA Programme — New Cohort',
    excerpt:
      'Are you or someone you know interested in becoming Catholic? A new RCIA cohort begins in June.',
    body: [
      'Are you or someone you know interested in becoming Catholic? A new cohort of the Rite of Christian Initiation of Adults (RCIA) begins in June.',
      'The RCIA is a journey of faith for adults who wish to be received into the Catholic Church — whether unbaptised, baptised in another Christian tradition, or baptised Catholic but yet to receive Confirmation and the Eucharist.',
      'Classes hold on Sunday mornings after the second Mass. Contact the parish office or fill out the enquiry form on our website to register your interest.',
    ],
    publishedAt: '2026-06-01T09:00:00+01:00',
    pinned: false,
    category: 'general',
    image: '/images/announcement-3.png',
    eventDate: '2026-06-21T11:00:00+01:00',
    eventLocation: 'Parish Hall',
  },
  {
    slug: 'corpus-christi-procession',
    title: 'Corpus Christi Procession',
    excerpt:
      'The parish will hold an outdoor Eucharistic Procession after the 11 am Mass on the Solemnity of Corpus Christi.',
    body: [
      'The parish will hold an outdoor Eucharistic Procession after the 11 am Mass on the Solemnity of the Most Holy Body and Blood of Christ (Corpus Christi).',
      'The procession will move through the parish grounds with four altars of repose, concluding with Benediction in the main church. All parish societies are asked to attend in their uniforms.',
      'All parishioners are invited to participate. Please assemble at the front of the church immediately after Mass.',
    ],
    publishedAt: '2026-05-28T09:00:00+01:00',
    pinned: false,
    category: 'liturgy',
    image: '/images/card-announcement.png',
    eventDate: '2026-06-07T11:00:00+01:00',
    eventLocation: 'Parish Grounds',
  },
  {
    slug: 'st-vincent-de-paul-food-drive',
    title: 'St. Vincent de Paul Food Drive',
    excerpt:
      'The Society of St. Vincent de Paul is collecting food items for families in need throughout the month of June.',
    body: [
      'The Society of St. Vincent de Paul is collecting non-perishable food items for families in need throughout the month of June.',
      'Collection baskets are placed at the church entrances. Most needed items: rice, beans, garri, cooking oil, tinned tomatoes, and powdered milk.',
      'Distribution will take place in the last week of June. To volunteer with sorting and distribution, please speak with any member of the Society after Mass.',
    ],
    publishedAt: '2026-06-02T09:00:00+01:00',
    pinned: false,
    category: 'charity',
    image: '/images/announcement-1.png',
  },
];

function isActive(announcement: Announcement, now: Date): boolean {
  if (!announcement.expiresAt) return true;
  return new Date(announcement.expiresAt).getTime() > now.getTime();
}

/** Active announcements: pinned first, then most recent. Expired items are hidden. */
export async function getAnnouncements(): Promise<Announcement[]> {
  const now = new Date();
  return announcements
    .filter((a) => isActive(a, now))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
}

export async function getAnnouncement(slug: string): Promise<Announcement | undefined> {
  return announcements.find((a) => a.slug === slug);
}
