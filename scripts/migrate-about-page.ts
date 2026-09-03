/**
 * One-off migration: brings the existing `aboutPage` singleton in line with the
 * current schema after the "pull About content from the CMS" change.
 *
 *   - Adds `scriptureQuote`, `stats[]`, and `milestones[]` — the data that used
 *     to be hardcoded in `app/(site)/about/page.tsx` — but only when the field is
 *     still missing (`setIfMissing`), so anything already entered in Studio is
 *     left untouched.
 *   - Removes the now-dropped `title` and `heroImage` fields so the Studio stops
 *     showing an "Unknown fields found" banner.
 *
 * Touches ONLY the `aboutPage` document (published + draft copy). Nothing else in
 * the dataset is read or written.
 *
 * Safe to re-run: once migrated, every `setIfMissing` is a no-op and the `unset`
 * targets are already gone.
 *
 * Run with: npx tsx scripts/migrate-about-page.ts
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
  perspective: 'raw', // include the draft copy (`drafts.aboutPage`), not just published
});

const key = (): string => randomUUID().slice(0, 12);

// --- default content (formerly hardcoded in app/(site)/about/page.tsx) --------

const scriptureQuote = {
  text: "God's love has been poured into our hearts through the Holy Spirit who has been given to us.",
  reference: 'Romans 5:5',
};

const stats = [
  { value: '1962', label: 'Founded' },
  { value: '1,000+', label: 'Seats at Mass' },
  { value: '20+', label: 'Societies & Ministries' },
  { value: '1000s', label: 'Families Served' },
].map((s) => ({ _key: key(), ...s }));

const milestones = [
  {
    year: '1962',
    title: 'A Chapel at the Airport',
    tag: 'Ikeja',
    description:
      'A small chapel is established to serve Catholic travellers and workers at the Lagos international airport, with Mass said by visiting priests.',
  },
  {
    year: '1978',
    title: 'Parish Erected',
    tag: 'Lagos',
    description:
      'The chaplaincy is formally erected as a parish of the Archdiocese of Lagos under the title of the Ascension of the Lord.',
  },
  {
    year: '1994',
    title: 'The Present Church',
    tag: 'Ascension',
    description:
      'The present church building is solemnly dedicated to the Ascension of Our Lord. Doors opened to the whole community of Ikeja — a house of prayer for God and for His glory.',
  },
  {
    year: '2010',
    title: 'Parish Societies Flourish',
    tag: 'Community',
    description:
      'The parish grows to host over twenty societies and pious organisations, from the Legion of Mary to the Young Catholic Professionals.',
  },
  {
    year: '2024',
    title: 'Renovation Begins',
    tag: 'Growth',
    description:
      'A two-phase renovation of the church and parish grounds begins, sustained entirely by the generosity of parishioners.',
  },
].map((m) => ({ _key: key(), ...m }));

interface AboutPageDoc {
  _id: string;
  title?: string;
  heroImage?: unknown;
  scriptureQuote?: unknown;
  stats?: unknown[];
  milestones?: unknown[];
}

async function migrate(): Promise<void> {
  const docs = await client.fetch<AboutPageDoc[]>(
    `*[_type == "aboutPage"] {
      _id, title, heroImage, scriptureQuote, stats, milestones
    }`,
  );

  if (docs.length === 0) {
    console.log('No aboutPage document found — nothing to migrate. Run `npm run seed` first.');
    return;
  }

  for (const doc of docs) {
    // GROQ projects a missing field as `null`, not `undefined`.
    const setIfMissing: Record<string, unknown> = {};
    if (doc.scriptureQuote == null) setIfMissing.scriptureQuote = scriptureQuote;
    if (doc.stats == null || doc.stats.length === 0) setIfMissing.stats = stats;
    if (doc.milestones == null || doc.milestones.length === 0) setIfMissing.milestones = milestones;

    const unset: string[] = [];
    if (doc.title != null) unset.push('title');
    if (doc.heroImage != null) unset.push('heroImage');

    if (Object.keys(setIfMissing).length === 0 && unset.length === 0) {
      console.log(`  ${doc._id} — already up to date, skipped`);
      continue;
    }

    let patch = client.patch(doc._id);
    if (Object.keys(setIfMissing).length > 0) patch = patch.setIfMissing(setIfMissing);
    if (unset.length > 0) patch = patch.unset(unset);
    await patch.commit();

    const added = Object.keys(setIfMissing);
    console.log(
      `  ${doc._id} — ${added.length ? `added [${added.join(', ')}]` : 'no new fields'}` +
        `${unset.length ? `, removed [${unset.join(', ')}]` : ''}`,
    );
  }

  console.log(`Done — processed ${docs.length} document(s).`);
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
