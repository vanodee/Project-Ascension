# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Catholic Church of the Ascension parish website — a greenfield Next.js project serving a parish in Ikeja, Lagos, Nigeria. Full requirements live in `ascension-parish-prd.md`.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** SCSS Modules
- **CMS:** Sanity. The Studio is **hosted by Sanity** at `ascension-parish.sanity.studio` (deployed via `npx sanity deploy`) — it is not embedded in the Next app. `sanity` + `@sanity/vision` are devDependencies (CLI/typegen tooling); `sanity.config.ts` and `sanity.cli.ts` are loaded only by the Sanity CLI. Redeploy the Studio after any schema or `sanity.config.ts` change; its bundle otherwise auto-updates.
- **Media:** Sanity native asset pipeline (images, audio via `cdn.sanity.io`); YouTube (embedded video)
- **Payments:** Paystack (popup JS, not redirect) — the `/give` route and its nav links are currently disabled (`notFound()` in `app/(site)/give/page.tsx`); remove the guard to re-enable
- **Calendar:** Google Calendar API (public calendar, API key auth)
- **Readings:** Universalis API (no auth required)
- **Forms:** Tally.so (embed only, no backend)
- **Livestream:** YouTube Data API v3 (server-side only)
- **Email:** Resend (transactional — only if contact form goes native)
- **Hosting:** Vercel

## Rendering Strategy

| Page | Strategy | Revalidation |
|---|---|---|
| Home, About, Sacraments, Clergy, Societies (list), Contact | SSG | Static |
| Announcements, Homilies, Gallery, Societies (detail) | ISR | 10 minutes |
| Parish Schedule (Google Calendar) | ISR | 1 hour |
| Daily Readings (Universalis) | ISR | Next midnight |
| Livestream | ISR | 5 minutes |

## Coding Conventions

- **TypeScript:** Strict mode — no `any` types, full null checks required
- **SCSS:** BEM naming inside CSS Modules (`block__element--modifier`)
- **Components:** Default to Server Components; only add `'use client'` when required (event handlers, hooks, browser APIs)
- **CSS:** Mobile-first — base styles target mobile, use `min-width` media queries for larger breakpoints

## Sanity Schema Document Types

- `aboutPage` — singleton
- `clergyMember` — collection
- `society` — collection (parish zones, organizations, and ministries; `name`, `shortName`, `color`, `societyType` enum, `logo` image; optional `subtitle`, `slogan` (`{greeting, response}`), `description` (Portable Text), and a "Key Details" fieldset — `zonePatron`, `established`, `meetingDay`, `zoneLeader`, `contact` (string arrays); referenced by `announcement` and `galleryAlbum` — use the "Ascension Family" entry for parish-wide content not tied to one society)
- `announcement` — collection (required `society` reference, optional `expiresAt` and `pinned`; no `category` field; detail view renders as a modal opened from `/announcements`, not a `[slug]` route)
- `homily` — collection (references `clergyMember`; audio stored as Sanity file asset)
- `sacramentPage` — collection (7 pages: rcia, baptism, eucharist, confirmation, reconciliation, anointing, matrimony)
- `galleryAlbum` — collection (required `society` reference; Sanity image assets; YouTube URL strings for video items; no `category` field)
- `donationCategory` — config list
- `siteSettings` — singleton (parish name, contact info, social links, YouTube channel ID)

## Integration Auth — Where Keys Live

| Service | Key Type | Location |
|---|---|---|
| Paystack | Public key | Client-side (popup JS only) |
| Universalis | None | Server-side fetch |
| Tally.so | Embed ID | Client-side embed |
| Google Calendar API | API Key | Server-side only |
| YouTube Data API v3 | API Key | Server-side Route Handler only |
| Sanity | Project ID + Dataset = public; Token = private | Token server-side only |
| Sanity Webhook | Shared secret | Server-side Route Handler only (`/api/revalidate`) |
| Resend | API Key | Server-side only |

## Environment Variables (.env.local)

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_ID=
YOUTUBE_API_KEY=
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=
RESEND_API_KEY=
SANITY_WEBHOOK_SECRET=
```

## Out of Scope (v1.0)

No member portal, no login, no seat booking, no confession scheduling, no multilingual support, no native mobile app, no e-commerce, no automated social media cross-posting.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
