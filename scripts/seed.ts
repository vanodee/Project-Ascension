/**
 * One-off content seed: pushes the same demo content currently hardcoded in lib/*.ts
 * (the mock data layer) into Sanity as real documents, so the Studio has something to
 * show in every section. Does NOT touch the frontend — pages still read from lib/*.ts.
 *
 * Run with: npx tsx scripts/seed.ts
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

// --- .env.local loader (no dotenv dependency in this project) ---------------
function loadEnvLocal(): void {
  const envPath = path.resolve(__dirname, '../.env.local');
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env.local');
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

// --- helpers ------------------------------------------------------------------
const key = (): string => randomUUID().slice(0, 12);

function portableText(paragraphs: string[]) {
  return paragraphs.map((text) => ({
    _type: 'block' as const,
    _key: key(),
    style: 'normal' as const,
    markDefs: [],
    children: [{ _type: 'span' as const, _key: key(), text, marks: [] }],
  }));
}

const assetCache = new Map<string, string>(); // local path -> asset _id

async function uploadImage(relPath: string): Promise<string> {
  const cached = assetCache.get(relPath);
  if (cached) return cached;
  const absPath = path.resolve(__dirname, '../public', relPath.replace(/^\//, ''));
  const buffer = readFileSync(absPath);
  const asset = await client.assets.upload('image', buffer, {
    filename: path.basename(absPath),
  });
  assetCache.set(relPath, asset._id);
  console.log(`  uploaded ${relPath} -> ${asset._id}`);
  return asset._id;
}

async function imageField(relPath: string, alt: string) {
  const assetId = await uploadImage(relPath);
  return {
    _type: 'image' as const,
    asset: { _type: 'reference' as const, _ref: assetId },
    alt,
  };
}

function slugField(current: string) {
  return { _type: 'slug' as const, current };
}

// --- seed data (mirrors lib/*.ts mock content) --------------------------------

async function seedClergy(): Promise<Map<string, string>> {
  console.log('Seeding clergy...');
  const clergy = [
    {
      slug: 'jerome-omoregie',
      name: 'Rev. Fr. Jerome Omoregie',
      title: 'Rev. Fr.',
      role: 'priest',
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
      bio: 'Fr. Emmanuel is the Associate Parish Priest. He coordinates the liturgy committee and the altar servers, and presides regularly at the Sunday 9 o’clock Mass.',
      email: 'fremmanuel@ascensioncatholicikeja.org',
      order: 2,
    },
    {
      slug: 'benedict-adeyemi',
      name: 'Rev. Fr. Benedict Adeyemi',
      title: 'Rev. Fr.',
      role: 'priest',
      bio: 'Fr. Benedict is resident priest and chaplain to the parish youth. His homilies on the Gospel of John have drawn listeners from across the Archdiocese.',
      email: 'frbenedict@ascensioncatholicikeja.org',
      order: 3,
    },
    {
      slug: 'sr-maria-eze',
      name: 'Sr. Maria Eze',
      title: 'Sr.',
      role: 'reverend_sister',
      bio: 'Sr. Maria of the Handmaids of the Holy Child Jesus coordinates the parish’s charity outreach and the children’s liturgy of the Word.',
      email: 'srmaria@ascensioncatholicikeja.org',
      order: 4,
    },
    {
      slug: 'sr-agnes-okonkwo',
      name: 'Sr. Agnes Okonkwo',
      title: 'Sr.',
      role: 'reverend_sister',
      bio: 'Sr. Agnes oversees the parish sacristy and the formation of the Church’s extraordinary ministers of Holy Communion.',
      email: 'sragnes@ascensioncatholicikeja.org',
      order: 5,
    },
    {
      slug: 'paul-adebayo',
      name: 'Mr. Paul Adebayo',
      title: 'Mr.',
      role: 'catechist',
      bio: 'Mr. Paul has been parish catechist for over fifteen years. He leads the RCIA programme and prepares candidates for Baptism, First Holy Communion, and Confirmation.',
      email: 'catechist@ascensioncatholicikeja.org',
      phone: '+234 802 345 6789',
      order: 6,
    },
  ];

  const idMap = new Map<string, string>();
  for (const c of clergy) {
    const _id = `clergy-${c.slug}`;
    const photo = await imageField('/images/clergy-photo.png', `Portrait of ${c.name}`);
    await client.createOrReplace({
      _id,
      _type: 'clergyMember',
      name: c.name,
      slug: slugField(c.slug),
      title: c.title,
      role: c.role,
      photo,
      bio: c.bio,
      email: c.email,
      ...(c.phone ? { phone: c.phone } : {}),
      order: c.order,
    });
    idMap.set(c.slug, _id);
    console.log(`  ${c.name}`);
  }
  return idMap;
}

async function seedSacraments(): Promise<void> {
  console.log('Seeding sacrament pages...');
  const sacraments = [
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
      tallyFormId: 'eqy8Kk',
    },
    {
      sacrament: 'baptism',
      title: 'Baptism',
      label: 'Sacrament of Initiation',
      summary: 'The gateway to life in the Spirit and the door which gives access to the other sacraments.',
      heroImage: '/images/sacrament-baptism.jpg',
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
      summary: 'The source and summit of the Christian life — the Body and Blood of Christ truly present.',
      heroImage: '/images/sacrament-eucharist.jpg',
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
      summary: 'The completion of baptismal grace through the gift of the Holy Spirit.',
      heroImage: '/images/sacrament-confirmation.jpg',
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
      summary: 'The sacrament of God’s mercy — confession, contrition, and absolution.',
      heroImage: '/images/sacrament-reconciliation.jpg',
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
      summary: 'Christ’s healing touch for the seriously ill, the elderly, and those preparing for surgery.',
      heroImage: '/images/sacrament-anointing.jpg',
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
      summary: 'The covenant by which a man and a woman establish a partnership of the whole of life.',
      heroImage: '/images/sacrament-matrimony.jpg',
      body: [
        'The Sacrament of Matrimony establishes a covenant between a man and a woman, ordered toward the good of the spouses and the procreation and education of children. Christ raises this covenant to the dignity of a sacrament.',
        'Couples intending to marry in the parish should see the Parish Priest at least six months before the proposed wedding date, before making any other arrangements.',
        'Marriage preparation includes a course organised by the parish marriage committee, the completion of the marriage enquiry forms, and the publication of banns on three Sundays.',
        'Required documents include baptism and confirmation certificates (issued within six months) and letters of freedom where applicable. The parish office will guide you through each step.',
      ],
    },
  ];

  for (const s of sacraments) {
    const heroImage = await imageField(s.heroImage, `${s.title} — ${s.label}`);
    await client.createOrReplace({
      _id: `sacrament-${s.sacrament}`,
      _type: 'sacramentPage',
      sacrament: s.sacrament,
      title: s.title,
      label: s.label,
      summary: s.summary,
      heroImage,
      body: portableText(s.body),
      ...(s.tallyFormId ? { tallyFormId: s.tallyFormId } : {}),
    });
    console.log(`  ${s.title}`);
  }
}

async function seedAnnouncements(): Promise<void> {
  console.log('Seeding announcements...');
  const announcements = [
    {
      slug: 'ascension-family-prayer',
      title: 'Ascension Family Prayer',
      excerpt: 'Join us for a special evening of Eucharistic Adoration, praise and worship.',
      body: [
        'The parish invites every family to an evening of Eucharistic Adoration, praise, and worship in the main church building. The evening will open with the Rosary, followed by exposition of the Blessed Sacrament and Benediction.',
        'Families are encouraged to come together — parents, children, and grandparents alike. Booklets with the order of prayer will be provided at the entrance.',
        'Light refreshments will be served afterwards at the parish hall. For enquiries, contact the parish office during the week.',
      ],
      publishedAt: '2026-05-10T09:00:00+01:00',
      pinned: true,
      category: 'liturgy',
      image: '/images/announcement_image.png',
      eventDate: '2026-05-17T19:00:00+01:00',
      eventLocation: 'Main Church Building',
    },
    {
      slug: 'youth-congress-registration',
      title: 'Youth Congress Registration Open',
      excerpt: 'Parishioners aged 16–35 are invited to register for the Annual Archdiocesan Youth Congress holding on June 14th.',
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
      excerpt: 'The second phase of the church renovation begins next month. Parishioners are encouraged to contribute generously to the Building Fund.',
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
      excerpt: 'Are you or someone you know interested in becoming Catholic? A new RCIA cohort begins in June.',
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
      excerpt: 'The parish will hold an outdoor Eucharistic Procession after the 11 am Mass on the Solemnity of Corpus Christi.',
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
      excerpt: 'The Society of St. Vincent de Paul is collecting food items for families in need throughout the month of June.',
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

  for (const a of announcements) {
    const image = await imageField(a.image, a.title);
    await client.createOrReplace({
      _id: `announcement-${a.slug}`,
      _type: 'announcement',
      title: a.title,
      slug: slugField(a.slug),
      excerpt: a.excerpt,
      body: portableText(a.body),
      image,
      category: a.category,
      pinned: a.pinned,
      publishedAt: a.publishedAt,
      ...(a.eventDate ? { eventDate: a.eventDate } : {}),
      ...(a.eventLocation ? { eventLocation: a.eventLocation } : {}),
    });
    console.log(`  ${a.title}`);
  }
}

async function seedHomilies(clergyIds: Map<string, string>): Promise<void> {
  console.log('Seeding homilies...');
  const seasonMap: Record<string, string> = {
    Advent: 'advent',
    Christmas: 'christmas',
    Lent: 'lent',
    Easter: 'easter',
    'Ordinary Time': 'ordinary',
  };
  const homilies = [
    {
      slug: 'feed-on-the-bread-of-life',
      title: 'Feed On The Bread Of Life',
      authorSlug: 'benedict-adeyemi',
      publishedAt: '2026-06-07T11:00:00+01:00',
      scriptureReference: 'John 6:51–58',
      liturgicalSeason: 'Ordinary Time',
      body: [
        'Fr. Benedict reflects on John 6:51–58 — the Eucharist as the living bread come down from heaven.',
        '“I am the living bread that came down from heaven. Whoever eats of this bread will live forever.” In these words our Lord makes a promise that no earthly food can make: the gift of Himself, wholly and without reserve.',
        'When we approach the altar, we do not receive a symbol. We receive the Lord of life, who desires to transform us into what we receive — His own Body, given for the life of the world.',
      ],
      audioDuration: '18:04',
    },
    {
      slug: 'the-spirit-of-truth',
      title: 'The Spirit of Truth Will Guide You',
      authorSlug: 'jerome-omoregie',
      publishedAt: '2026-05-31T09:00:00+01:00',
      scriptureReference: 'John 16:12–15',
      liturgicalSeason: 'Easter',
      body: [
        'On the Solemnity of the Most Holy Trinity, Fr. Jerome considers the inner life of God revealed in Christ.',
        'The Trinity is not a puzzle to be solved but a communion to be entered. The Father gives everything to the Son; the Son gives everything back in love; and that love between them is the Holy Spirit, poured into our hearts.',
        'To be baptised in the name of the Father, the Son, and the Holy Spirit is to be drawn into that eternal exchange of love.',
      ],
      audioDuration: '14:32',
    },
    {
      slug: 'go-and-make-disciples',
      title: 'Go and Make Disciples',
      authorSlug: 'emmanuel-okafor',
      publishedAt: '2026-05-24T09:00:00+01:00',
      scriptureReference: 'Matthew 28:16–20',
      liturgicalSeason: 'Easter',
      body: [
        'On the Solemnity of the Ascension, Fr. Emmanuel preaches on the great commission.',
        'The Ascension is not Christ’s departure from the world but the beginning of His presence everywhere — through us, His Body, the Church.',
        '“Go therefore and make disciples of all nations.” That commission was not given to the apostles alone. It is given to every one of us, in our homes, our offices, and our streets here in Ikeja.',
      ],
      audioDuration: '16:48',
    },
    {
      slug: 'peace-i-leave-with-you',
      title: 'Peace I Leave With You',
      authorSlug: 'jerome-omoregie',
      publishedAt: '2026-05-17T09:00:00+01:00',
      scriptureReference: 'John 14:23–29',
      liturgicalSeason: 'Easter',
      body: [
        'Fr. Jerome reflects on the peace of Christ — a peace the world cannot give.',
        'The peace our Lord promises is not the absence of trouble. It is the presence of God in the midst of trouble. It is the calm of a heart that knows it is held.',
        'Whoever loves Christ will keep His word, and the Father and the Son will come and make their home in that soul. There is no deeper peace than to be the dwelling-place of God.',
      ],
      audioDuration: '15:21',
    },
    {
      slug: 'the-good-shepherd',
      title: 'My Sheep Hear My Voice',
      authorSlug: 'benedict-adeyemi',
      publishedAt: '2026-04-26T09:00:00+01:00',
      scriptureReference: 'John 10:27–30',
      liturgicalSeason: 'Easter',
      body: [
        'On Good Shepherd Sunday, Fr. Benedict preaches on the voice of Christ in a noisy world.',
        'Many voices compete for our attention — but only one voice calls us each by name. The sheep know the shepherd not by argument but by familiarity, by the long habit of listening.',
        'Prayer is how we learn the sound of His voice, so that when He calls, we follow without fear.',
      ],
      audioDuration: '13:55',
    },
    {
      slug: 'rend-your-hearts',
      title: 'Rend Your Hearts, Not Your Garments',
      authorSlug: 'emmanuel-okafor',
      publishedAt: '2026-02-18T07:00:00+01:00',
      scriptureReference: 'Joel 2:12–18',
      liturgicalSeason: 'Lent',
      body: [
        'An Ash Wednesday homily on true conversion.',
        'The prophet Joel calls us to return to the Lord with our whole heart. Fasting, prayer, and almsgiving are not performances — they are the slow turning of the heart back to its true home.',
        'Lent is the springtime of the soul. What we surrender in these forty days makes room for the life of Easter.',
      ],
      audioDuration: '11:40',
    },
  ];

  for (const h of homilies) {
    const authorId = clergyIds.get(h.authorSlug);
    if (!authorId) throw new Error(`Unknown clergy slug for homily author: ${h.authorSlug}`);
    await client.createOrReplace({
      _id: `homily-${h.slug}`,
      _type: 'homily',
      title: h.title,
      slug: slugField(h.slug),
      author: { _type: 'reference', _ref: authorId },
      publishedAt: h.publishedAt,
      scriptureReference: h.scriptureReference,
      liturgicalSeason: seasonMap[h.liturgicalSeason],
      body: portableText(h.body),
      audioDuration: h.audioDuration,
    });
    console.log(`  ${h.title}`);
  }
}

async function seedGallery(): Promise<void> {
  console.log('Seeding gallery albums...');
  const categoryMap: Record<string, string> = {
    Liturgical: 'liturgical',
    Youth: 'youth',
    Outreach: 'outreach',
    Fundraiser: 'fundraiser',
  };
  const albums = [
    {
      slug: 'ycp-induction-may-2026',
      title: 'YCP Induction',
      eventDate: '2026-05-10',
      category: 'Youth',
      coverImage: '/images/gallery-1.jpg',
      description: 'Induction ceremony of new members into the Young Catholic Professionals, followed by a reception at the parish hall.',
      media: [
        { url: '/images/gallery-1.jpg', caption: 'New members take the YCP pledge', altText: 'Young Catholic Professionals members standing together at their induction' },
        { url: '/images/gallery-4.jpg', caption: 'Group photograph after Mass', altText: 'Group photograph of parishioners outside the church' },
        { url: '/images/gallery-5.jpg', caption: 'Reception at the parish hall', altText: 'Parishioners at the reception in the parish hall' },
      ],
    },
    {
      slug: 'first-holy-communion-april-2026',
      title: 'First Holy Communion',
      eventDate: '2026-04-19',
      category: 'Liturgical',
      coverImage: '/images/gallery-2.jpg',
      description: 'Children of the parish receive Our Lord in the Holy Eucharist for the first time.',
      media: [
        { url: '/images/gallery-2.jpg', caption: 'First communicants in procession', altText: 'Children in white processing into the church for First Holy Communion' },
        { url: '/images/gospel-photo.png', caption: 'The Liturgy of the Eucharist', altText: 'The celebrant elevating the host during Mass' },
        { url: '/images/gallery-3.jpg', caption: 'Thanksgiving after Mass', altText: 'Families gathered for thanksgiving after the First Communion Mass' },
      ],
    },
    {
      slug: 'cultural-day-october-2025',
      title: 'Cultural Day',
      eventDate: '2025-10-05',
      category: 'Fundraiser',
      coverImage: '/images/gallery-3.jpg',
      description: 'A celebration of the cultures of our parish family, with traditional attire, dance, and a harvest fundraiser.',
      media: [
        { url: '/images/gallery-3.jpg', caption: 'Parishioners in traditional attire', altText: 'Parishioners dressed in colourful traditional attire on Cultural Day' },
        { url: '/images/gallery-1.jpg', caption: 'Cultural dance presentation', altText: 'Dancers performing during the Cultural Day celebration' },
      ],
    },
    {
      slug: 'legion-of-mary-love-feast-june-2025',
      title: 'Legion of Mary, Love Feast',
      eventDate: '2025-06-22',
      category: 'Outreach',
      coverImage: '/images/gallery-4.jpg',
      description: 'The Legion of Mary hosts its annual Love Feast for members and auxiliaries.',
      media: [
        { url: '/images/gallery-4.jpg', caption: 'Members at the Love Feast', altText: 'Legion of Mary members seated together at the Love Feast' },
        { url: '/images/gallery-5.jpg', caption: 'Sharing a meal together', altText: 'Parishioners sharing a meal at the Legion of Mary Love Feast' },
      ],
    },
    {
      slug: 'professionals-day-april-2025',
      title: 'Professionals Day',
      eventDate: '2025-04-27',
      category: 'Outreach',
      coverImage: '/images/gallery-5.jpg',
      description: 'Thanksgiving Mass and career mentorship session organised by the parish professionals’ guild.',
      media: [
        { url: '/images/gallery-5.jpg', caption: 'Thanksgiving procession', altText: 'Parish professionals in procession during the thanksgiving Mass' },
        { url: '/images/gallery-2.jpg', caption: 'Mentorship session', altText: 'A mentorship session during Professionals Day' },
      ],
    },
  ];

  for (const a of albums) {
    const coverImage = await imageField(a.coverImage, `${a.title} — cover photo`);
    const media = [];
    for (const m of a.media) {
      const image = await imageField(m.url, m.altText);
      media.push({
        _type: 'imageItem',
        _key: key(),
        image,
        caption: m.caption,
      });
    }
    await client.createOrReplace({
      _id: `gallery-${a.slug}`,
      _type: 'galleryAlbum',
      title: a.title,
      slug: slugField(a.slug),
      eventDate: a.eventDate,
      category: categoryMap[a.category],
      description: a.description,
      coverImage,
      media,
    });
    console.log(`  ${a.title}`);
  }
}

async function seedDonationCategories(): Promise<void> {
  console.log('Seeding donation categories...');
  const categories = [
    { id: 'general-offering', label: 'General Offering', description: 'Supports the day-to-day life and ministry of the parish.' },
    { id: 'building-fund', label: 'Building Fund', description: 'Funds the ongoing renovation and expansion of the church buildings.' },
    { id: 'charity', label: 'Charity & Outreach', description: 'Feeds and supports the poor through the Society of St. Vincent de Paul.' },
    { id: 'thanksgiving', label: 'Thanksgiving', description: 'An offering of gratitude for blessings received.' },
    { id: 'mass-intentions', label: 'Mass Intentions', description: 'Offerings for Masses to be said for your intentions.' },
  ];
  for (const c of categories) {
    await client.createOrReplace({
      _id: `donation-${c.id}`,
      _type: 'donationCategory',
      id: c.id,
      label: c.label,
      description: c.description,
    });
    console.log(`  ${c.label}`);
  }
}

async function seedSiteSettings(): Promise<void> {
  console.log('Seeding site settings...');
  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
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
        _type: 'object',
        _key: key(),
        heading: "This Sunday's Masses",
        times: ['7:00 am • First Mass', '9:00 am • Second Mass'],
        note: 'First Mass begins at the Chapel',
      },
      {
        _type: 'object',
        _key: key(),
        heading: 'Masses This Week',
        times: ['7:00 am • Monday – Saturday', '12:00 pm • Monday – Saturday'],
        note: 'First Mass begins at the Chapel',
      },
      {
        _type: 'object',
        _key: key(),
        heading: 'Confession',
        times: ['4:00 pm • Saturdays'],
        note: 'And by appointment with any priest',
      },
      {
        _type: 'object',
        _key: key(),
        heading: 'Location',
        times: ['MMIA, Ikeja, Lagos.'],
        note: 'Near the International Airport main gate',
      },
    ],
  });
  console.log('  Site Settings');
}

async function seedAboutPage(): Promise<void> {
  console.log('Seeding about page...');
  const heroImage = await imageField(
    '/images/hero-bg.png',
    'The Catholic Church of the Ascension, Ikeja, Lagos',
  );
  await client.createOrReplace({
    _id: 'aboutPage',
    _type: 'aboutPage',
    title: 'About Us',
    heroImage,
    missionStatement:
      'To worship God in spirit and in truth, to form disciples of the Ascended Lord, and to serve every person who passes through our doors — for God and for His glory.',
    body: portableText([
      'What began as a handful of the faithful gathering for Sunday Mass has grown, by God’s grace, into one of the most vibrant parishes of the Archdiocese of Lagos.',
      'The Catholic Church of the Ascension began as a small chapel serving travellers and workers at the Murtala Muhammed International Airport, Ikeja. Today our parish family numbers in the thousands — drawn from every corner of Nigeria and beyond, reflecting the journeys that pass daily through this part of Lagos.',
      'We take our name from the Ascension of Our Lord — the mystery in which Christ, lifted up in glory, sends His Church into the world. That commission shapes everything we do: the liturgy we celebrate, the disciples we form, and the charity we practise.',
    ]),
  });
  console.log('  About Page');
}

async function main(): Promise<void> {
  console.log(`Seeding project ${projectId} (dataset: ${dataset})\n`);
  const clergyIds = await seedClergy();
  await seedSacraments();
  await seedAnnouncements();
  await seedHomilies(clergyIds);
  await seedGallery();
  await seedDonationCategories();
  await seedSiteSettings();
  await seedAboutPage();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
