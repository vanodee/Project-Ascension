import type { Homily } from './types';

// Mirrors the `homily` collection in Sanity (audio hosted on Cloudinary).
// Mocked until the CMS is wired up — audio URLs point at a sample file.
const MOCK_AUDIO_URL =
  'https://res.cloudinary.com/demo/video/upload/dog.mp3';

const homilies: Homily[] = [
  {
    slug: 'feed-on-the-bread-of-life',
    title: 'Feed On The Bread Of Life',
    authorSlug: 'benedict-adeyemi',
    authorName: 'Rev. Fr. Benedict Adeyemi',
    publishedAt: '2026-06-07T11:00:00+01:00',
    scriptureReference: 'John 6:51–58',
    liturgicalSeason: 'Ordinary Time',
    body: [
      'Fr. Benedict reflects on John 6:51–58 — the Eucharist as the living bread come down from heaven.',
      '“I am the living bread that came down from heaven. Whoever eats of this bread will live forever.” In these words our Lord makes a promise that no earthly food can make: the gift of Himself, wholly and without reserve.',
      'When we approach the altar, we do not receive a symbol. We receive the Lord of life, who desires to transform us into what we receive — His own Body, given for the life of the world.',
    ],
    audioUrl: MOCK_AUDIO_URL,
    audioDuration: '18:04',
  },
  {
    slug: 'the-spirit-of-truth',
    title: 'The Spirit of Truth Will Guide You',
    authorSlug: 'jerome-omoregie',
    authorName: 'Rev. Fr. Jerome Omoregie',
    publishedAt: '2026-05-31T09:00:00+01:00',
    scriptureReference: 'John 16:12–15',
    liturgicalSeason: 'Easter',
    body: [
      'On the Solemnity of the Most Holy Trinity, Fr. Jerome considers the inner life of God revealed in Christ.',
      'The Trinity is not a puzzle to be solved but a communion to be entered. The Father gives everything to the Son; the Son gives everything back in love; and that love between them is the Holy Spirit, poured into our hearts.',
      'To be baptised in the name of the Father, the Son, and the Holy Spirit is to be drawn into that eternal exchange of love.',
    ],
    audioUrl: MOCK_AUDIO_URL,
    audioDuration: '14:32',
  },
  {
    slug: 'go-and-make-disciples',
    title: 'Go and Make Disciples',
    authorSlug: 'emmanuel-okafor',
    authorName: 'Rev. Fr. Emmanuel Okafor',
    publishedAt: '2026-05-24T09:00:00+01:00',
    scriptureReference: 'Matthew 28:16–20',
    liturgicalSeason: 'Easter',
    body: [
      'On the Solemnity of the Ascension, Fr. Emmanuel preaches on the great commission.',
      'The Ascension is not Christ’s departure from the world but the beginning of His presence everywhere — through us, His Body, the Church.',
      '“Go therefore and make disciples of all nations.” That commission was not given to the apostles alone. It is given to every one of us, in our homes, our offices, and our streets here in Ikeja.',
    ],
    audioUrl: MOCK_AUDIO_URL,
    audioDuration: '16:48',
  },
  {
    slug: 'peace-i-leave-with-you',
    title: 'Peace I Leave With You',
    authorSlug: 'jerome-omoregie',
    authorName: 'Rev. Fr. Jerome Omoregie',
    publishedAt: '2026-05-17T09:00:00+01:00',
    scriptureReference: 'John 14:23–29',
    liturgicalSeason: 'Easter',
    body: [
      'Fr. Jerome reflects on the peace of Christ — a peace the world cannot give.',
      'The peace our Lord promises is not the absence of trouble. It is the presence of God in the midst of trouble. It is the calm of a heart that knows it is held.',
      'Whoever loves Christ will keep His word, and the Father and the Son will come and make their home in that soul. There is no deeper peace than to be the dwelling-place of God.',
    ],
    audioUrl: MOCK_AUDIO_URL,
    audioDuration: '15:21',
  },
  {
    slug: 'the-good-shepherd',
    title: 'My Sheep Hear My Voice',
    authorSlug: 'benedict-adeyemi',
    authorName: 'Rev. Fr. Benedict Adeyemi',
    publishedAt: '2026-04-26T09:00:00+01:00',
    scriptureReference: 'John 10:27–30',
    liturgicalSeason: 'Easter',
    body: [
      'On Good Shepherd Sunday, Fr. Benedict preaches on the voice of Christ in a noisy world.',
      'Many voices compete for our attention — but only one voice calls us each by name. The sheep know the shepherd not by argument but by familiarity, by the long habit of listening.',
      'Prayer is how we learn the sound of His voice, so that when He calls, we follow without fear.',
    ],
    audioUrl: MOCK_AUDIO_URL,
    audioDuration: '13:55',
  },
  {
    slug: 'rend-your-hearts',
    title: 'Rend Your Hearts, Not Your Garments',
    authorSlug: 'emmanuel-okafor',
    authorName: 'Rev. Fr. Emmanuel Okafor',
    publishedAt: '2026-02-18T07:00:00+01:00',
    scriptureReference: 'Joel 2:12–18',
    liturgicalSeason: 'Lent',
    body: [
      'An Ash Wednesday homily on true conversion.',
      'The prophet Joel calls us to return to the Lord with our whole heart. Fasting, prayer, and almsgiving are not performances — they are the slow turning of the heart back to its true home.',
      'Lent is the springtime of the soul. What we surrender in these forty days makes room for the life of Easter.',
    ],
    audioUrl: MOCK_AUDIO_URL,
    audioDuration: '11:40',
  },
];

export async function getHomilies(): Promise<Homily[]> {
  return [...homilies].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getHomily(slug: string): Promise<Homily | undefined> {
  return homilies.find((h) => h.slug === slug);
}
