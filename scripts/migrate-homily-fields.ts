/**
 * One-off migration: moves existing `homily` documents from the old
 * `scriptureReference` (string) + `audioDuration` ("MM:SS" string) fields onto
 * the new `scriptureReferences` (array of strings) + `audioDurationSeconds`
 * (number) fields, then removes the old fields.
 *
 * Safe to re-run: a document already migrated (new field set, old field gone)
 * is skipped. Patches both published and draft copies of each document via
 * `perspective: 'raw'`, since Studio shows drafts by default and the "Unknown
 * fields found" warning banner reads from whichever copy is open.
 *
 * Run with: npx tsx scripts/migrate-homily-fields.ts
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
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
  perspective: 'raw', // include draft copies (`drafts.*`), not just published
});

interface LegacyHomilyDoc {
  _id: string;
  title: string;
  scriptureReference?: string;
  scriptureReferences?: string[];
  audioDuration?: string;
  audioDurationSeconds?: number;
}

/** Parses "MM:SS" or "H:MM:SS" into whole seconds. */
function parseDurationToSeconds(duration: string): number | null {
  const parts = duration.split(':').map((part) => Number(part.trim()));
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }
  return parts.reduce((total, part) => total * 60 + part, 0);
}

async function migrate(): Promise<void> {
  const docs = await client.fetch<LegacyHomilyDoc[]>(
    `*[_type == "homily" && (defined(scriptureReference) || defined(audioDuration))] {
      _id, title, scriptureReference, scriptureReferences, audioDuration, audioDurationSeconds
    }`,
  );

  if (docs.length === 0) {
    console.log('Nothing to migrate — no homilies carry the old fields.');
    return;
  }

  for (const doc of docs) {
    const set: Record<string, unknown> = {};
    const unset: string[] = [];

    // GROQ projects a missing field as `null`, not `undefined` — check both,
    // or this "already migrated?" guard silently skips every `set()`.
    if (doc.scriptureReference != null) {
      if (doc.scriptureReferences == null) {
        set.scriptureReferences = [doc.scriptureReference];
      }
      unset.push('scriptureReference');
    }

    if (doc.audioDuration != null) {
      if (doc.audioDurationSeconds == null) {
        const seconds = parseDurationToSeconds(doc.audioDuration);
        if (seconds !== null) {
          set.audioDurationSeconds = seconds;
        } else {
          console.warn(`  ! Couldn't parse audioDuration "${doc.audioDuration}" on ${doc._id}`);
        }
      }
      unset.push('audioDuration');
    }

    let patch = client.patch(doc._id);
    if (Object.keys(set).length > 0) patch = patch.set(set);
    if (unset.length > 0) patch = patch.unset(unset);
    await patch.commit();

    console.log(`  Migrated ${doc._id} (${doc.title})`);
  }

  console.log(`Done — migrated ${docs.length} document(s).`);
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
