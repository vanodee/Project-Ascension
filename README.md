# Project Ascension

Official website for the **Catholic Church of the Ascension**, Ikeja, Lagos, Nigeria — built with Next.js 16 App Router.

## Overview

A modern, content-driven parish website providing parishioners with easy access to mass schedules, daily readings, announcements, homilies, sacrament information, gallery, giving, and a live-stream portal.

## Tech Stack

| Concern | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | SCSS Modules (BEM) |
| CMS | Sanity (Studio + API) |
| Media | Sanity CDN (images, audio) |
| Payments | Paystack (popup JS) |
| Calendar | Google Calendar API |
| Daily Readings | Universalis API |
| Forms | Tally.so (embed) |
| Livestream | YouTube Data API v3 |
| Email | Resend |
| Hosting | Vercel |

## Pages

| Route | Description | Rendering |
|---|---|---|
| `/` | Home | SSG |
| `/about` | Parish history & mission | SSG |
| `/clergy` | Clergy directory | SSG |
| `/sacraments/[slug]` | Seven sacrament pages | SSG |
| `/contact` | Contact & map | SSG |
| `/announcements` | Parish announcements, searchable with a society filter; detail view is an in-page modal, not a route | ISR (10 min) |
| `/homilies` | Homily archive with audio | ISR (10 min) |
| `/gallery` | Photo & video albums, searchable with a society filter | ISR (10 min) |
| `/societies` | Parish societies directory, searchable with a type filter | SSG |
| `/societies/[slug]` | Single society (hero, description, slogan, key info) | ISR (10 min) |
| `/schedule` | Mass & event schedule | ISR (1 hr) |
| `/readings` | Daily liturgical readings | ISR (next midnight) |
| `/livestream` | Live Sunday Mass | ISR (5 min) |
| `/give` | Online giving (Paystack) — currently disabled (`notFound()`) and unlinked from nav | SSG |

Content is edited in the **Sanity-hosted Studio** at
[ascension-parish.sanity.studio](https://ascension-parish.sanity.studio) — it is
not part of this Next app. See "Sanity Studio" below.

All ISR pages also revalidate on-demand: a Sanity webhook hits
`/api/revalidate` on publish, so edits appear within seconds rather than
waiting for the timer (see `app/api/revalidate/route.ts`).

## Project Structure

```
app/
  (site)/         # All public-facing pages & SCSS modules, sharing Header/Footer
  api/revalidate/ # Sanity webhook receiver for on-demand ISR
components/
  layout/         # Header, Footer
  ui/             # Reusable UI components (Button, AudioPlayer, etc.)
lib/              # Data-fetching helpers (Sanity, Google Calendar, YouTube, etc.)
sanity/
  lib/            # Sanity client, image URL builder, GROQ queries
  schemas/        # Sanity document type definitions (compiled into the hosted Studio)
  components/     # Custom Studio input components
styles/           # Global SCSS tokens, mixins, and base styles
public/           # Static assets (icons, images)
scripts/          # Dev utilities (seed.ts pushes demo content into Sanity)
sanity.config.ts  # Studio config — loaded by the Sanity CLI only, not the Next app
sanity.cli.ts     # Sanity CLI config (deploy target, studio host)
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Sanity project
- API keys for Google Calendar, YouTube, Paystack, and Resend

### Installation

```bash
npm install
```

### Environment Variables

Copy the example below into `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=
SANITY_WEBHOOK_SECRET=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_ID=
YOUTUBE_API_KEY=
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=
RESEND_API_KEY=
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Sanity Studio

The Studio is hosted by Sanity at
[ascension-parish.sanity.studio](https://ascension-parish.sanity.studio) and is
**not** part of the Next app (`sanity` / `@sanity/vision` are devDependencies —
CLI tooling only). It auto-updates its bundle; redeploy only when the schema or
Studio config (`sanity.config.ts`) changes:

```bash
npx sanity login      # once per machine, as an account with access to project p3p9t4z1
npx sanity deploy     # rebuilds & publishes to ascension-parish.sanity.studio
npx sanity dev        # optional: run the Studio locally at http://localhost:3333
```

### Seed demo content

Pushes placeholder content into every Sanity document type. Safe to re-run —
every write uses `createIfNotExists` keyed on deterministic IDs, so it only
creates documents that don't already exist; it will never overwrite content
you've since edited in Studio (real logos, colors, renamed titles, etc.).
Never change these calls back to `createOrReplace` — see the warning
comment at the top of `scripts/seed.ts`:

```bash
npm run seed
```

### Build

```bash
npm run build
```

## Coding Conventions

- **TypeScript:** Strict mode — no `any`, full null checks
- **SCSS:** BEM naming inside CSS Modules
- **Components:** Server Components by default; `'use client'` only when required
- **CSS:** Mobile-first with `min-width` media queries

## Deployment

The site is deployed on **Vercel**. Pushing to `master` triggers a production build automatically.

## License

Private — all rights reserved. Catholic Church of the Ascension, Ikeja, Lagos.
