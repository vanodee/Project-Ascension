import type { ClergyMember } from './types';

// Mirrors the `clergyMember` collection in Sanity. Mocked until the CMS is wired up.
const clergy: ClergyMember[] = [
  {
    slug: 'jerome-omoregie',
    name: 'Rev. Fr. Jerome Omoregie',
    title: 'Rev. Fr.',
    role: 'priest',
    photo: '/images/clergy-photo.png',
    bio: 'Fr. Jerome has served as Parish Priest of the Church of the Ascension since 2021. He holds a licentiate in Sacred Theology and has a deep devotion to the Holy Eucharist and to catechesis for young adults.',
    email: 'frjerome@ascensioncatholicikeja.org',
    phone: '+234 801 111 2233',
    order: 1,
  },
  {
    slug: 'emmanuel-okafor',
    name: 'Rev. Fr. Emmanuel Okafor',
    title: 'Rev. Fr.',
    role: 'priest',
    photo: '/images/clergy-photo.png',
    bio: 'Fr. Emmanuel is the Associate Parish Priest. He coordinates the liturgy committee and the altar servers, and presides regularly at the Sunday 9 o’clock Mass.',
    email: 'fremmanuel@ascensioncatholicikeja.org',
    order: 2,
  },
  {
    slug: 'benedict-adeyemi',
    name: 'Rev. Fr. Benedict Adeyemi',
    title: 'Rev. Fr.',
    role: 'priest',
    photo: '/images/clergy-photo.png',
    bio: 'Fr. Benedict is resident priest and chaplain to the parish youth. His homilies on the Gospel of John have drawn listeners from across the Archdiocese.',
    email: 'frbenedict@ascensioncatholicikeja.org',
    order: 3,
  },
  {
    slug: 'sr-maria-eze',
    name: 'Sr. Maria Eze',
    title: 'Sr.',
    role: 'reverend_sister',
    photo: '/images/clergy-photo.png',
    bio: 'Sr. Maria of the Handmaids of the Holy Child Jesus coordinates the parish’s charity outreach and the children’s liturgy of the Word.',
    email: 'srmaria@ascensioncatholicikeja.org',
    order: 4,
  },
  {
    slug: 'sr-agnes-okonkwo',
    name: 'Sr. Agnes Okonkwo',
    title: 'Sr.',
    role: 'reverend_sister',
    photo: '/images/clergy-photo.png',
    bio: 'Sr. Agnes oversees the parish sacristy and the formation of the Church’s extraordinary ministers of Holy Communion.',
    email: 'sragnes@ascensioncatholicikeja.org',
    order: 5,
  },
  {
    slug: 'paul-adebayo',
    name: 'Mr. Paul Adebayo',
    title: 'Mr.',
    role: 'catechist',
    photo: '/images/clergy-photo.png',
    bio: 'Mr. Paul has been parish catechist for over fifteen years. He leads the RCIA programme and prepares candidates for Baptism, First Holy Communion, and Confirmation.',
    email: 'catechist@ascensioncatholicikeja.org',
    phone: '+234 802 345 6789',
    order: 6,
  },
];

export async function getClergy(): Promise<ClergyMember[]> {
  return [...clergy].sort((a, b) => a.order - b.order);
}

export async function getClergyMember(slug: string): Promise<ClergyMember | undefined> {
  return clergy.find((member) => member.slug === slug);
}
