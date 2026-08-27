/**
 * One-off backfill: populates the society detail fields added for the /societies/[slug]
 * buildout (subtitle, slogan, description, zonePatron, established, meetingDay, zoneLeader,
 * contact) on the *existing* society documents already live in Sanity.
 *
 * Unlike scripts/seed.ts (which creates new documents), this PATCHES existing ones. It uses
 * `.setIfMissing()` exclusively — never `.set()` — so a field that already has a value (set
 * here on a previous run, or edited by hand in Studio) is left completely untouched. Re-running
 * this script is always safe and idempotent. It never touches name/slug/shortName/color/
 * societyType/logo.
 *
 * Run with: npx tsx scripts/backfill-society-details.ts
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

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

const blockKey = (): string => randomUUID().slice(0, 12);

function portableText(paragraphs: string[]) {
  return paragraphs.map((text) => ({
    _type: 'block' as const,
    _key: blockKey(),
    style: 'normal' as const,
    markDefs: [],
    children: [{ _type: 'span' as const, _key: blockKey(), text, marks: [] }],
  }));
}

// The parish's own call-and-response — used for the parish-wide entity and the three
// geographic zones, which don't have a slogan distinct from the parish's.
const PARISH_SLOGAN = {
  greeting: 'Ascension Family...',
  response: '...For God and His Glory!',
};

interface SocietyDetailSeed {
  slug: string;
  subtitle: string;
  slogan: { greeting: string; response: string };
  description: string[];
  zonePatron: string;
  established: string;
  meetingDay: string;
  zoneLeader: string[];
  contact: string[];
}

const details: SocietyDetailSeed[] = [
  {
    slug: 'ascension-family',
    subtitle: 'The whole parish family of the Ascension, gathered as one.',
    slogan: PARISH_SLOGAN,
    description: [
      'The Ascension Family is the parish itself — every zone, every society, and every ministry gathered under one roof in the spirit of the Ascended Lord.',
      'Since the parish began serving the community around the airport in Ikeja, the Ascension Family has grown into a home for worship, formation, and service that welcomes every parishioner regardless of which zone or society they belong to.',
      'Announcements, events, and appeals that concern the whole parish — rather than any single zone or organization — are shared under the Ascension Family banner.',
    ],
    zonePatron: 'Christ the Ascended Lord',
    established: '1978',
    meetingDay: 'Every Sunday, all Masses',
    zoneLeader: ['Mr. Patrick Chukwuma (Parish Pastoral Council Chairman)', 'Mrs. Grace Effiong (Vice Chairperson)'],
    contact: ['info@ascensioncatholicikeja.org', '+234 801 234 5678'],
  },
  {
    slug: 'all-saints-zone',
    subtitle: "United in faith, growing in fellowship, reaching out in love.",
    slogan: PARISH_SLOGAN,
    description: [
      'The All Saints Zone coordinates the spiritual and temporal life of Ascension Parish families within our designated boundaries. By bringing liturgy into the home and extending outreach to our local neighborhood, we create a sanctuary of community.',
      'Our activities include scripture reflection classes, charity visits to nearby nursing facilities, and family sports days. We operate under the patronage of All Saints, looking to their holy lives as maps for our daily journey of discipleship.',
      'Each year we celebrate our patronal feast on November 1st with a procession, a special Mass, and a community dinner, and we invite every family in our zone to our monthly meeting for prayer, planning, and fellowship.',
    ],
    zonePatron: 'All Saints',
    established: '1987',
    meetingDay: 'Every 2nd Sunday',
    zoneLeader: ['Mrs. Adaeze Okonkwo'],
    contact: ['allsaintszone@ascensioncatholicikeja.org'],
  },
  {
    slug: 'st-theresa-of-calcutta-zone',
    subtitle: 'Small things, done with great love, for the poorest of the poor.',
    slogan: PARISH_SLOGAN,
    description: [
      'The St Theresa of Calcutta Zone brings together families in our section of the parish under the patronage of Mother Teresa, whose life of humble service to the poorest of the poor continues to inspire our own works of charity.',
      'Zone members visit the sick and housebound within our boundaries, organize a monthly food-and-clothing drive for families in need, and support the parish\'s wider charitable outreach through the Society of St. Vincent de Paul.',
      'We gather monthly for prayer and zone business, and mark our patronal day around September 5th each year with a Mass and a shared meal.',
    ],
    zonePatron: 'St Teresa of Calcutta (Mother Teresa)',
    established: '1994',
    meetingDay: 'Every 3rd Sunday',
    zoneLeader: ['Mrs. Chioma Okafor', 'Mr. Ikechukwu Eze'],
    contact: ['sttheresazone@ascensioncatholicikeja.org', '+234 803 456 7812'],
  },
  {
    slug: 'st-rita-of-cascia-zone',
    subtitle: 'Patient in trial, faithful in prayer, hopeful in every impossible cause.',
    slogan: PARISH_SLOGAN,
    description: [
      'The St Rita of Cascia Zone gathers parishioners in our locality under the patronage of St. Rita, the Augustinian nun venerated as the patroness of impossible and difficult causes.',
      'True to our patroness, the zone maintains a special prayer intention book for families facing hardship, and members commit to praying for one another\'s intentions between meetings. We also support widows and the elderly within our boundaries with regular visits.',
      'Our patronal feast falls on May 22nd, celebrated with a novena leading up to a Mass and fellowship afterward. New families in the zone are always welcome at our monthly meeting.',
    ],
    zonePatron: 'St Rita of Cascia',
    established: '1991',
    meetingDay: 'Every 4th Sunday',
    zoneLeader: ['Mr. Emeka Obi'],
    contact: ['stritazone@ascensioncatholicikeja.org', '+234 805 678 1234'],
  },
  {
    slug: 'catholic-men-organization',
    subtitle: 'Men of the parish, standing firm in faith and fatherhood.',
    slogan: { greeting: 'Men of Ascension...', response: '...Standing Firm in Faith!' },
    description: [
      'The Catholic Men Organization brings together the men of the parish for prayer, fellowship, and service — encouraging one another as husbands, fathers, and leaders in the Church and in society.',
      'The CMO organizes the annual Men\'s Retreat, leads the parish\'s Lenten Stations of the Cross on Fridays, and takes a lead role in the upkeep of the church premises and the security of parish events.',
      'We meet monthly to plan our activities and support one another, under the patronage of St. Joseph the Worker, model of quiet, faithful labor.',
    ],
    zonePatron: 'St Joseph the Worker',
    established: '1985',
    meetingDay: 'Every 1st Saturday',
    zoneLeader: ['Mr. Babatunde Ogunleye', 'Mr. Uchenna Umeh', 'Mr. Segun Adeyinka'],
    contact: ['cmo@ascensioncatholicikeja.org', '+234 806 112 2334'],
  },
  {
    slug: 'catholic-women-organization',
    subtitle: 'Daughters of the Church, serving the parish with a mother\'s heart.',
    slogan: { greeting: 'Daughters of the Church...', response: '...Servants of the Lord!' },
    description: [
      'The Catholic Women Organization unites the women of the parish in prayer, charity, and mutual support, carrying forward a long tradition of women\'s leadership in the life of the Church.',
      'The CWO runs the parish\'s widows\' welfare fund, coordinates hospitality for baptisms and first communions, and hosts an annual women\'s conference open to the whole archdiocese.',
      'Members meet monthly for prayer and planning, under the patronage of St. Monica, whose perseverance in prayer for her family is a model for every mother in our society.',
    ],
    zonePatron: 'St Monica',
    established: '1980',
    meetingDay: 'Every 3rd Saturday',
    zoneLeader: ['Mrs. Folasade Adebayo', 'Mrs. Ngozi Chukwu'],
    contact: ['cwo@ascensioncatholicikeja.org', '+234 807 223 3445'],
  },
  {
    slug: 'catholic-youth-organization',
    subtitle: 'Young, alive in Christ, and unafraid to be counted.',
    slogan: { greeting: 'Youth Alive!', response: 'Christ Our Strength!' },
    description: [
      'The Catholic Youth Organization of Nigeria (CYON) chapter at Ascension gathers young parishioners for fellowship, formation, and service, giving voice and leadership experience to the next generation of the Church.',
      'CYON members lead the parish\'s youth choir on designated Sundays, organize inter-parish sports competitions, and represent Ascension at the Archdiocesan Youth Congress each year.',
      'We meet weekly for Bible study and planning, under the patronage of St. Kizito, the young Ugandan martyr celebrated for his courage in the faith.',
    ],
    zonePatron: 'St Kizito',
    established: '2005',
    meetingDay: 'Every Sunday, after the 2nd Mass',
    zoneLeader: ['Mr. Olumide Fashola', 'Miss. Amaka Nnamdi', 'Mr. Tobenna Iheanacho'],
    contact: ['cyon@ascensioncatholicikeja.org'],
  },
  {
    slug: 'young-catholic-professionals',
    subtitle: 'Called to excellence in career and in Christ.',
    slogan: { greeting: 'Called to Excellence...', response: '...Living Christ at Work!' },
    description: [
      'Young Catholic Professionals brings together working parishioners in their twenties and thirties for fellowship, mentorship, and career support, grounded in the conviction that faith belongs in the workplace as much as in the pew.',
      'YCP hosts a monthly mentorship session pairing newer professionals with more experienced members, organizes an annual thanksgiving Mass for career milestones, and runs a small emergency support fund for members between jobs.',
      'We gather monthly for a thanksgiving Mass and fellowship, under the patronage of St. Thomas More, patron of professionals who sought to live his faith with integrity in public life.',
    ],
    zonePatron: 'St Thomas More',
    established: '2015',
    meetingDay: 'Every last Friday of the month',
    zoneLeader: ['Mrs. Yetunde Bankole', 'Mr. Chukwuemeka Nwosu'],
    contact: ['ycp@ascensioncatholicikeja.org', '+234 808 334 4556'],
  },
  {
    slug: 'legion-of-mary',
    subtitle: 'Handmaids and servants of Mary, at war against sin.',
    slogan: { greeting: 'Legio Mariae...', response: '...Ancilla Domini, fiat mihi!' },
    description: [
      'The Legion of Mary is a lay apostolic association founded by Frank Duff in Dublin in 1921, and our praesidium at Ascension carries forward its mission of prayer and person-to-person evangelization under the patronage of Our Lady.',
      'Members commit to weekly attendance, a daily recitation of the Legion\'s prayers (the Tessera), and an active work of apostolate — typically home and hospital visitation — assigned each week at the praesidium meeting.',
      'The Ascension praesidium visits the sick and housebound of the parish, prepares families for infant baptism, and supports the RCIA programme through personal accompaniment of catechumens.',
    ],
    zonePatron: 'Our Lady, Mediatrix of All Graces',
    established: '1998',
    meetingDay: 'Every Wednesday, 5:00 pm',
    zoneLeader: ['Mrs. Chinwe Okoro', 'Mr. Emmanuel Udoh'],
    contact: ['legionofmary@ascensioncatholicikeja.org'],
  },
  {
    slug: 'sacred-heart-immaculate-heart',
    subtitle: 'Devoted to the twin hearts of Jesus and Mary.',
    slogan: { greeting: 'Sacred Heart of Jesus...', response: '...Have Mercy on Us!' },
    description: [
      'This society fosters devotion to the Sacred Heart of Jesus and the Immaculate Heart of Mary, two devotions the Church has long held together as a single school of love and reparation.',
      'Members lead First Friday devotions to the Sacred Heart and First Saturday devotions to the Immaculate Heart, and maintain the parish\'s Sacred Heart shrine with fresh flowers and candles throughout the year.',
      'We welcome any parishioner drawn to a deeper devotional life to join our monthly gathering for the Holy Hour and fellowship that follows.',
    ],
    zonePatron: 'The Sacred Heart of Jesus',
    established: '1989',
    meetingDay: 'First Friday of the month',
    zoneLeader: ['Mrs. Comfort Etim'],
    contact: ['sacredheart@ascensioncatholicikeja.org', '+234 809 445 5667'],
  },
  {
    slug: 'saint-vincent-de-paul',
    subtitle: 'Servants of the poor, for the love of Christ alone.',
    slogan: { greeting: 'Servants of the Poor...', response: '...For the Love of Christ!' },
    description: [
      'The Society of St. Vincent de Paul traces its origins to a small group of students led by Frédéric Ozanam in Paris in 1833, who set out to serve the poor of their city in person and in the spirit of its patron, St. Vincent de Paul.',
      'Our conference at Ascension visits families in need within the parish, distributes food and clothing collected from parishioners, and quietly assists with school fees and emergency needs referred through the parish office.',
      'All assistance is offered person-to-person and treated with strict confidentiality, in keeping with the Society\'s long tradition of humble, direct charity.',
    ],
    zonePatron: 'St Vincent de Paul',
    established: '1996',
    meetingDay: 'Every 2nd Saturday',
    zoneLeader: ['Mr. Patrick Chukwuma', 'Mrs. Blessing Adewale'],
    contact: ['svdp@ascensioncatholicikeja.org', '+234 810 556 6778'],
  },
  {
    slug: 'charismatic-renewal',
    subtitle: 'On fire with the Holy Spirit, alive in praise and worship.',
    slogan: { greeting: 'Come, Holy Spirit...', response: '...Renew the Face of the Earth!' },
    description: [
      'The Catholic Charismatic Renewal traces back to a 1967 retreat at Duquesne University that rekindled a spirit-filled prayer movement within the Catholic Church, which spread to Nigeria in the years that followed and now touches nearly every parish in the country.',
      'Our chapter at Ascension leads praise and worship at the monthly Charismatic Mass, hosts a weekly prayer meeting with teaching and intercession, and organizes the parish\'s annual healing and deliverance retreat.',
      'All are welcome at our weekly gathering, which is open to any parishioner seeking a deeper encounter with the Holy Spirit in prayer.',
    ],
    zonePatron: 'The Holy Spirit',
    established: '2001',
    meetingDay: 'Every Thursday, 6:00 pm',
    zoneLeader: ['Mrs. Rita Iwuchukwu', 'Mr. Olumide Fashola'],
    contact: ['ccrn@ascensioncatholicikeja.org'],
  },
  {
    slug: 'board-of-lectors',
    subtitle: 'Proclaiming the Word of God with clarity and reverence.',
    slogan: { greeting: 'The Word of the Lord...', response: '...Thanks Be to God!' },
    description: [
      'The Board of Lectors trains and schedules the men and women who proclaim the Scripture readings at every Mass, under the patronage of St. Jerome, the Church\'s great translator and student of the Word.',
      'New lectors complete a short formation covering pronunciation, pacing, and the proper reverence due to the Sacred Scriptures before they are scheduled to read at Mass.',
      'The Board meets monthly to prepare the reading roster and review upcoming feasts and their proper readings.',
    ],
    zonePatron: 'St Jerome',
    established: '1979',
    meetingDay: 'Every 1st Sunday',
    zoneLeader: ['Mrs. Grace Effiong'],
    contact: ['lectors@ascensioncatholicikeja.org'],
  },
  {
    slug: 'altar-servers',
    subtitle: 'Serving at the altar with gladness and reverence.',
    slogan: { greeting: 'Serve the Lord...', response: '...With Gladness!' },
    description: [
      'The Altar Servers assist the priest at every Mass and liturgical celebration, under the patronage of St. Tarcisius, the young martyr honored as the patron of altar servers for his devotion to the Blessed Sacrament.',
      'Servers are trained in the proper conduct of the Mass, from the entrance procession to the final blessing, and are scheduled in rotating teams across the parish\'s Sunday and weekday Masses.',
      'Weekly practice sessions cover new servers\' formation as well as preparation for major feasts such as Holy Week and Christmas.',
    ],
    zonePatron: 'St Tarcisius',
    established: '1982',
    meetingDay: 'Every Saturday, 10:00 am',
    zoneLeader: ['Mr. Tobenna Iheanacho', 'Miss. Amaka Nnamdi'],
    contact: ['altarservers@ascensioncatholicikeja.org'],
  },
  {
    slug: 'church-wardens',
    subtitle: 'Guardians of the House of God, in ready and quiet service.',
    slogan: { greeting: 'Guardians of the House of God...', response: '...We Stand Ready!' },
    description: [
      'The Board of Church Wardens keeps order and welcome during every Mass and parish event — ushering, managing seating, and assisting parishioners who need help — under the patronage of St. Peter, keeper of the keys entrusted to his care.',
      'Wardens are a visible, steady presence at every service, guiding visitors, managing collections, and helping the sanctuary run smoothly from the moment the doors open.',
      'The Board meets monthly to review the duty roster and coordinate with the parish office on upcoming events requiring additional coverage.',
    ],
    zonePatron: 'St Peter',
    established: '1978',
    meetingDay: 'Every 1st Monday',
    zoneLeader: ['Mr. Emeka Obi', 'Mr. Segun Adeyinka'],
    contact: ['wardens@ascensioncatholicikeja.org', '+234 811 667 7889'],
  },
  {
    slug: 'st-cecilia-choir',
    subtitle: 'Lifting the parish in song, to the glory of God.',
    slogan: { greeting: 'Sing to the Lord...', response: '...A New Song!' },
    description: [
      'St Cecilia\'s Choir leads the parish in sacred music at the principal Sunday Mass and on major feast days, under the patronage of St. Cecilia, honored across the Church as the patroness of musicians.',
      'The choir rehearses new hymns and responsorial psalms each week, and prepares special repertoire for Christmas, Holy Week, and other high feasts of the liturgical year.',
      'New voices are always welcome — no formal training is required, only a willingness to rehearse faithfully and serve the parish\'s worship through song.',
    ],
    zonePatron: 'St Cecilia',
    established: '1980',
    meetingDay: 'Every Tuesday & Thursday, 6:00 pm',
    zoneLeader: ['Mrs. Chinwe Okoro'],
    contact: ['choir@ascensioncatholicikeja.org'],
  },
  {
    slug: 'divine-mercy-society',
    subtitle: 'Trusting in the boundless mercy of Christ, for the whole world.',
    slogan: { greeting: 'Jesus, I Trust in You...', response: '...Have Mercy on Us and the Whole World!' },
    description: [
      'The Divine Mercy Society fosters devotion to the Divine Mercy of Jesus as revealed to St. Faustina Kowalska, whose diary gave the Church the Chaplet of Divine Mercy and the image inscribed "Jesus, I Trust in You."',
      'Members lead the recitation of the Chaplet of Divine Mercy every Sunday afternoon and organize the parish\'s celebration of Divine Mercy Sunday, the feast established on the Second Sunday of Easter.',
      'The society also visits the sick to pray the Chaplet with them, carrying the message of God\'s mercy to those who are suffering.',
    ],
    zonePatron: 'St Faustina Kowalska',
    established: '2008',
    meetingDay: 'Sundays, 3:00 pm (Hour of Mercy)',
    zoneLeader: ['Mrs. Blessing Adewale', 'Mr. Uchenna Umeh'],
    contact: ['divinemercy@ascensioncatholicikeja.org'],
  },
];

async function main(): Promise<void> {
  console.log(`Backfilling society details for project ${projectId} (dataset: ${dataset})\n`);

  for (const d of details) {
    const _id = `society-${d.slug}`;
    const doc = await client.getDocument(_id).catch(() => undefined);
    if (!doc) {
      // A couple of societies were created directly in Studio with generated _ids
      // rather than the `society-<slug>` convention seed.ts uses — look those up by slug.
      const bySlug = await client.fetch<{ _id: string } | null>(
        `*[_type == "society" && slug.current == $slug][0]{ _id }`,
        { slug: d.slug },
      );
      if (!bySlug) {
        console.warn(`  SKIP — no society found for slug "${d.slug}"`);
        continue;
      }
      await patchOne(bySlug._id, d);
      continue;
    }
    await patchOne(_id, d);
  }

  console.log('\nDone.');
}

async function patchOne(id: string, d: SocietyDetailSeed): Promise<void> {
  await client
    .patch(id)
    .setIfMissing({
      subtitle: d.subtitle,
      slogan: d.slogan,
      description: portableText(d.description),
      zonePatron: d.zonePatron,
      established: d.established,
      meetingDay: d.meetingDay,
      zoneLeader: d.zoneLeader,
      contact: d.contact,
    })
    .commit();
  console.log(`  ${d.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
