# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Catholic Church of the Ascension parish website — a greenfield Next.js project serving a parish in Ikeja, Lagos, Nigeria. Full requirements live in `ascension-parish-prd.md`.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** SCSS Modules
- **CMS:** Sanity. The Studio is **hosted by Sanity** at `ascension-parish.sanity.studio` (deployed via `npx sanity deploy`) — it is not embedded in the Next app. `sanity` + `@sanity/vision` are devDependencies (CLI/typegen tooling); `sanity.config.ts` and `sanity.cli.ts` are loaded only by the Sanity CLI. Redeploy the Studio after any schema or `sanity.config.ts` change; its bundle otherwise auto-updates.
- **Media:** Sanity native asset pipeline (images, audio via `cdn.sanity.io`); YouTube (embedded video)
- **Calendar:** Parish schedule managed in Sanity (`recurringEvent` + `parishEvent`, expanded to occurrences in `lib/calendar.ts`)
- **Readings:** Universalis API (no auth required)
- **Forms:** Tally.so (embed only, no backend)
- **Livestream:** Keyless YouTube (server-side scrape of the channel `/live` page + `videos.xml` RSS feed; no Google Cloud project / API key)
- **Hosting:** Vercel

> **Online giving is out of scope.** The parish subcommittee rejected a website-hosted
> donation feature — there is no `/give` route, no Paystack integration, and no
> `donationCategory` schema. Do not re-add them without a fresh decision.

## Rendering Strategy

| Page | Strategy | Revalidation |
|---|---|---|
| About, Sacraments, Clergy, Societies (list) | SSG | Static |
| Announcements, Homilies, Gallery, Societies (detail) | ISR | 10 minutes |
| Home, Contact | ISR | 10 min / 1 h; Mass-times blocks turn over at next Lagos midnight |
| Parish Schedule | ISR | Next Lagos midnight (1 h backstop) |
| Daily Readings (Universalis) | ISR | Next midnight |
| Livestream | ISR | 1 minute; Mass-times block turns over at next Lagos midnight |

## Coding Conventions

- **TypeScript:** Strict mode — no `any` types, full null checks required
- **SCSS:** BEM naming inside CSS Modules (`block__element--modifier`)
- **Components:** Default to Server Components; only add `'use client'` when required (event handlers, hooks, browser APIs)
- **CSS:** Mobile-first — base styles target mobile, use `min-width` media queries for larger breakpoints
- **Lint:** `next lint` was removed in Next 16 — linting runs through the ESLint CLI (`npm run lint` → `eslint .`, flat config in `eslint.config.mjs`, `eslint-config-next/core-web-vitals`). `eslint` is pinned to v9 (v10 breaks the bundled React plugin). Run `npm run typecheck` / `npm run lint` / `npm test` before a commit.

## App-Level Files (`app/`)

- `layout.tsx` — root `<html>`, fonts, and `generateMetadata` (title template, `metadataBase` from `lib/siteUrl.ts`, canonical, robots, OpenGraph/Twitter). No header/footer here.
- `(site)/layout.tsx` — the public shell: `Header` + `Footer`, fed by `getSiteSettings()`.
- `not-found.tsx` — root 404 + catch-all for unmatched URLs. Parish logo + "Return to homepage", **no site chrome** (renders in the root layout only).
- `(site)/error.tsx` — error boundary for every public page, inside the site chrome; uses Next 16's `retry` prop (not `reset`).
- `global-error.tsx` — last-resort boundary if the root layout itself throws; ships its own `<html>`/`<body>`.
- `sitemap.ts` / `robots.ts` — generate `/sitemap.xml` (static routes + Sanity slugs) and `/robots.txt`, both keyed to `lib/siteUrl.ts`. Add new static routes to `sitemap.ts`'s `STATIC_ROUTES`.
- `manifest.ts` — PWA web manifest.
- `api/revalidate/route.ts` — Sanity on-publish webhook → on-demand ISR.

## Sanity Schema Document Types

- `aboutPage` — singleton (`body` history Portable Text, `scriptureQuote` `{text, reference}`, `stats[]` `{value, label}` max 4, `missionStatement`, `milestones[]` `{year, title, tag, description}`; page title + hero are hard-coded in `app/(site)/about/page.tsx`)
- `clergyMember` — collection
- `society` — collection (parish zones, organizations, and ministries; `name`, `shortName`, `color`, `societyType` enum, `logo` image; optional `subtitle`, `slogan` (`{greeting, response}`), `description` (Portable Text), and a "Key Details" fieldset — `zonePatron`, `established`, `meetingDay`, `zoneLeader`, `contact` (string arrays); referenced by `announcement` and `galleryAlbum` — use the "Ascension Family" entry for parish-wide content not tied to one society)
- `announcement` — collection (required `society` reference, optional `expiresAt` and `pinned`; no `category` field; detail view renders as a modal opened from `/announcements`, not a `[slug]` route)
- `homily` — collection (references `clergyMember`; audio stored as Sanity file asset)
- `sacramentPage` — collection (7 pages: rcia, baptism, eucharist, confirmation, reconciliation, anointing, matrimony)
- `galleryAlbum` — collection (required `society` reference; `media[]` is `imageItem` only — Sanity image assets with alt + caption; no `category` field. Video support was scoped for v1 but never built and has been removed from the schema — see `qol-ideas.md`)
- `recurringEvent` — collection (parish schedule: a repeating rule — `frequency` weekly/monthly, `daysOfWeek` or `monthlyOrdinal`+`monthlyWeekday`, optional `durationMinutes`, optional `startDate`/`endDate`, `active`; `overrides[]` array of `{date, mode: cancelled|modified, time?, location?, title?, note?}` for per-date exceptions. Start is either `startMode: 'fixed'` with `time` as a `"HH:MM"` Lagos string, or `startMode: 'follows'` with `anchorEvent` (reference) + `anchorRelation` (after|before|during) — the occurrence's start is derived from the anchor's occurrence on the same date). Expanded into occurrences by `lib/calendar.ts`.
- `parishEvent` — collection (parish schedule: one-off dated event — `startDate`, optional `endDate` for multi-day, `allDay` toggle. Start is `startMode: 'fixed'` with `startTime`/`endTime` as `"HH:MM"` strings, or `startMode: 'follows'` with `anchorEvent` (reference to a `recurringEvent` or `parishEvent` on the same date) + `anchorRelation`)
- `siteSettings` — singleton (parish name, contact info, social links, YouTube channel ID)

## Sanity Studio Deployment

The Studio is hosted by Sanity at `ascension-parish.sanity.studio` and deployed
manually — there is no CI for it. **On every "commit and push" request, check
whether the pushed commits touch `sanity/**`, `sanity.config.ts`, or
`sanity.cli.ts`; if so, run `npx sanity deploy` after pushing.**

- Deploy at most once per push; skip it when none of those paths changed.
- `sanity deploy` is idempotent — a redundant run republishes the same bundle,
  so when unsure, deploy.
- Only ships our schema/structure/config; the Studio framework auto-updates
  (`deployment.autoUpdates`).
- Requires `npx sanity login` as an account with access to project `p3p9t4z1`.

## Integration Auth — Where Keys Live

| Service | Key Type | Location |
|---|---|---|
| Universalis | None | Server-side fetch |
| Tally.so | Embed ID | Client-side embed |
| Parish schedule | None (Sanity content) | `lib/calendar.ts` |
| YouTube (livestream) | None (public scrape + RSS) | Server-side fetch in `lib/livestream.ts` |
| YouTube channel ID | Public | `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` |
| Sanity | Project ID + Dataset = public; Token = private | Token server-side only |
| Sanity Webhook | Shared secret | Server-side Route Handler only (`/api/revalidate`) |

## Environment Variables (.env.local)

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=
SANITY_WEBHOOK_SECRET=
# Optional — set only once the parish is on its own domain (see below).
NEXT_PUBLIC_SITE_URL=
```

## Going live on a custom domain

The canonical origin (metadataBase, `sitemap.xml`, `robots.txt`, OpenGraph URLs)
is resolved in `lib/siteUrl.ts`: `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL`
→ `http://localhost:3000`. While the domain is undecided, reviews run on the
Vercel URL and nothing needs setting.

**When the parish confirms a production domain, ask the user to confirm the exact
URL, then:**

- Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://www.parish.org`) in Vercel (Production)
  and in `.env.local`.
- Add the domain in Vercel → Project → Domains; pick the canonical host (www vs apex)
  and 308-redirect the other.
- Update `siteSettings` / any hard-coded parish URL references in Sanity.
- Resubmit `sitemap.xml` in Google Search Console for the new property; verify the
  new domain there.
- Check the `metadataBase` / OG tags resolve to the new origin on a deployed page.

## Out of Scope (v1.0)

No member portal, no login, no seat booking, no confession scheduling, no multilingual support, no native mobile app, no e-commerce, no online giving / donations, no automated social media cross-posting.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
