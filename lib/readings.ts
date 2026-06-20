import type { DailyReadings } from './types';

// Universalis API integration (https://universalis.com/{date}/Mass.json).
// Mocked until the live fetch is wired up — the function signature matches
// what the real server-side fetch will return.
const todaysReadings: DailyReadings = {
  date: '2026-06-12',
  liturgicalDay: 'Sixth Sunday of Easter',
  lectionaryYear: 'Year B',
  season: 'Easter',
  readings: [
    {
      label: 'First Reading',
      reference: 'Proverbs 8:22–31',
      excerpt:
        '"Before the mountains were settled, before the hills, I was brought forth — rejoicing before him always, rejoicing in his inhabited world..."',
      text: [
        'Thus says the Wisdom of God: “The Lord possessed me at the beginning of his ways, the first of his acts of old. Ages ago I was set up, at the first, before the beginning of the earth.”',
        '“When there were no depths I was brought forth, when there were no springs abounding with water. Before the mountains had been shaped, before the hills, I was brought forth.”',
        '“When he established the heavens, I was there; when he drew a circle on the face of the deep... then I was beside him, like a master workman, and I was daily his delight, rejoicing before him always, rejoicing in his inhabited world and delighting in the children of man.”',
      ],
    },
    {
      label: 'Responsorial Psalm',
      reference: 'Psalm 8:4–5, 6–7, 8–9',
      excerpt: 'O Lord, our Lord, how majestic is your name in all the earth.',
      text: [
        'When I see your heavens, the work of your fingers, the moon and stars that you set in place — what is man that you are mindful of him, and a son of man that you care for him?',
        'Yet you have made him little less than a god; with glory and honour you crowned him. You gave him power over the works of your hands, put all things under his feet.',
        'All of them, sheep and oxen, yes, even the savage beasts, birds of the air, and fish that make their way through the waters.',
      ],
    },
    {
      label: 'Second Reading',
      reference: 'Romans 5:1–5',
      excerpt:
        '"...God\'s love has been poured into our hearts through the Holy Spirit who has been given to us."',
      text: [
        'Brothers and sisters: Since we have been justified by faith, we have peace with God through our Lord Jesus Christ, through whom we have obtained access by faith into this grace in which we stand, and we rejoice in hope of the glory of God.',
        'More than that, we rejoice in our sufferings, knowing that suffering produces endurance, and endurance produces character, and character produces hope.',
        'And hope does not put us to shame, because God’s love has been poured into our hearts through the Holy Spirit who has been given to us.',
      ],
    },
    {
      label: 'Gospel',
      reference: 'John 16:12–15',
      excerpt:
        '"When the Spirit of truth comes, he will guide you into all the truth, for he will not speak on his own authority..."',
      text: [
        'Jesus said to his disciples: “I still have many things to say to you, but you cannot bear them now. When the Spirit of truth comes, he will guide you into all the truth, for he will not speak on his own authority, but whatever he hears he will speak, and he will declare to you the things that are to come.”',
        '“He will glorify me, for he will take what is mine and declare it to you. All that the Father has is mine; therefore I said that he will take what is mine and declare it to you.”',
      ],
    },
  ],
};

/** Fetch the readings for today (mocked Universalis response). */
export async function getDailyReadings(): Promise<DailyReadings> {
  return todaysReadings;
}

/** Seconds until the next midnight (Africa/Lagos is UTC+1, no DST) — used for ISR. */
export function secondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(60, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}
