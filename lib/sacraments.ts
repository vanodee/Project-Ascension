import type { SacramentPage, SacramentKey } from './types';

// Mirrors the `sacramentPage` collection in Sanity (7 pages).
// Mocked until the CMS is wired up.
const sacraments: SacramentPage[] = [
  {
    sacrament: 'rcia',
    title: 'RCIA — Becoming Catholic',
    label: 'Rite of Christian Initiation of Adults',
    summary:
      'The journey by which adults are received into the Catholic Church — from first enquiry to the Easter sacraments.',
    heroImage: '/images/rcia-photo.png',
    body: [
      'The Rite of Christian Initiation of Adults (RCIA) is the Church’s way of welcoming adults who wish to become Catholic. It is a journey made in community — with catechists, sponsors, and the whole parish walking alongside you.',
      'The journey unfolds in stages: a period of enquiry, where your questions are welcomed; the catechumenate, a time of formation in the faith; and finally the celebration of the Sacraments of Initiation — Baptism, Confirmation, and the Holy Eucharist — usually at the Easter Vigil.',
      'No question is too small and no past is a barrier. Whether you have never been baptised, were baptised in another Christian tradition, or are a baptised Catholic seeking Confirmation, the RCIA is for you.',
      'A new cohort begins each year. Classes hold on Sunday mornings after the second Mass in the parish hall. Begin by filling out the enquiry form below — our catechist will contact you personally.',
    ],
    tallyFormId: 'mock-rcia-form',
  },
  {
    sacrament: 'baptism',
    title: 'Baptism',
    label: 'Sacrament of Initiation',
    summary:
      'The gateway to life in the Spirit and the door which gives access to the other sacraments.',
    heroImage: '/images/gospel-photo.png',
    body: [
      'Holy Baptism is the basis of the whole Christian life, the gateway to life in the Spirit, and the door which gives access to the other sacraments. Through Baptism we are freed from sin and reborn as children of God.',
      'Infant baptisms are celebrated in the parish on the second and fourth Saturdays of each month. Parents should obtain and complete a baptism form from the parish office at least two weeks beforehand.',
      'Parents and godparents attend a short preparation class on the Friday evening before the baptism. Godparents must be practising Catholics who have received the sacraments of initiation.',
      'Adults seeking baptism are warmly invited to join the RCIA programme.',
    ],
  },
  {
    sacrament: 'eucharist',
    title: 'Holy Eucharist',
    label: 'Sacrament of Initiation',
    summary:
      'The source and summit of the Christian life — the Body and Blood of Christ truly present.',
    heroImage: '/images/gospel-photo.png',
    body: [
      'The Holy Eucharist is the source and summit of the Christian life. In the Blessed Sacrament, Christ is truly, really, and substantially present — Body, Blood, Soul, and Divinity.',
      'Mass is celebrated daily in the parish. See the Parish Schedule for Mass times, including Sunday and weekday Masses.',
      'Children are prepared for First Holy Communion through the parish catechism classes, which run from October to April each year. Enrolment forms are available from the catechist after Sunday Mass.',
      'Eucharistic Adoration holds every first Friday of the month, concluding with Benediction.',
    ],
  },
  {
    sacrament: 'confirmation',
    title: 'Confirmation',
    label: 'Sacrament of Initiation',
    summary:
      'The completion of baptismal grace through the gift of the Holy Spirit.',
    heroImage: '/images/card-sunday.png',
    body: [
      'Confirmation perfects baptismal grace. It is the sacrament which gives the Holy Spirit in order to root us more deeply in divine filiation, incorporate us more firmly into Christ, and strengthen our bond with the Church.',
      'Candidates for Confirmation are prepared through a year-long catechesis programme. Teenagers and adults who have received Baptism and First Holy Communion are eligible to enrol.',
      'The Sacrament is administered annually by the Archbishop or his delegate. The date is announced in the parish each year.',
      'Sponsors must be confirmed, practising Catholics. Adults seeking Confirmation may also join the RCIA programme.',
    ],
  },
  {
    sacrament: 'reconciliation',
    title: 'Reconciliation',
    label: 'Sacrament of Healing',
    summary:
      'The sacrament of God’s mercy — confession, contrition, and absolution.',
    heroImage: '/images/card-announcement.png',
    body: [
      'In the Sacrament of Reconciliation (Confession), we receive God’s pardon for sins committed after Baptism and are reconciled with the Church which our sins have wounded.',
      'Confessions are heard every Saturday at 4:00 pm in the main church, and at any other time by appointment with any of the priests.',
      'During Advent and Lent, the parish holds communal penitential services with several visiting confessors.',
      '“Let us then with confidence draw near to the throne of grace, that we may receive mercy and find grace to help in time of need.” (Hebrews 4:16)',
    ],
  },
  {
    sacrament: 'anointing',
    title: 'Anointing of the Sick',
    label: 'Sacrament of Healing',
    summary:
      'Christ’s healing touch for the seriously ill, the elderly, and those preparing for surgery.',
    heroImage: '/images/card-homily.png',
    body: [
      'The Anointing of the Sick is given to those who are seriously ill, the elderly in weakened condition, and those preparing for major surgery. Through this sacrament, Christ strengthens the soul and sometimes the body.',
      'The sacrament may be received at home, in hospital, or in the church. Please contact the parish office to arrange a visit from a priest — at any hour in case of emergency.',
      'The parish also celebrates a communal Anointing of the Sick during the annual World Day of the Sick (February 11th, the memorial of Our Lady of Lourdes).',
      'Holy Communion is brought to the housebound by the parish’s extraordinary ministers every Sunday. Contact the parish office to be added to the visitation list.',
    ],
  },
  {
    sacrament: 'matrimony',
    title: 'Holy Matrimony',
    label: 'Sacrament at the Service of Communion',
    summary:
      'The covenant by which a man and a woman establish a partnership of the whole of life.',
    heroImage: '/images/rcia-photo.png',
    body: [
      'The Sacrament of Matrimony establishes a covenant between a man and a woman, ordered toward the good of the spouses and the procreation and education of children. Christ raises this covenant to the dignity of a sacrament.',
      'Couples intending to marry in the parish should see the Parish Priest at least six months before the proposed wedding date, before making any other arrangements.',
      'Marriage preparation includes a course organised by the parish marriage committee, the completion of the marriage enquiry forms, and the publication of banns on three Sundays.',
      'Required documents include baptism and confirmation certificates (issued within six months) and letters of freedom where applicable. The parish office will guide you through each step.',
    ],
  },
];

const ORDER: SacramentKey[] = [
  'rcia',
  'baptism',
  'eucharist',
  'confirmation',
  'reconciliation',
  'anointing',
  'matrimony',
];

export async function getSacraments(): Promise<SacramentPage[]> {
  return ORDER.map((key) => {
    const page = sacraments.find((s) => s.sacrament === key);
    if (!page) throw new Error(`Missing sacrament page: ${key}`);
    return page;
  });
}

export async function getSacrament(key: string): Promise<SacramentPage | undefined> {
  return sacraments.find((s) => s.sacrament === key);
}

export function isSacramentKey(value: string): value is SacramentKey {
  return (ORDER as string[]).includes(value);
}
