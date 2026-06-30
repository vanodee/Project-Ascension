# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Catholic Church of the Ascension parish website — a greenfield Next.js project serving a parish in Ikeja, Lagos, Nigeria. Full requirements live in `ascension-parish-prd.md`.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** SCSS Modules
- **CMS:** Sanity (Studio + API)
- **Media:** Sanity native asset pipeline (images, audio via `cdn.sanity.io`); YouTube (embedded video)
- **Payments:** Paystack (popup JS, not redirect)
- **Calendar:** Google Calendar API (public calendar, API key auth)
- **Readings:** Universalis API (no auth required)
- **Forms:** Tally.so (embed only, no backend)
- **Livestream:** YouTube Data API v3 (server-side only)
- **Email:** Resend (transactional — only if contact form goes native)
- **Hosting:** Vercel

## Rendering Strategy

| Page | Strategy | Revalidation |
|---|---|---|
| Home, About, Sacraments, Clergy, Contact | SSG | Static |
| Announcements, Homilies, Gallery | ISR | 10 minutes |
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
- `announcement` — collection (requires `expiryDate` and `pinned` fields)
- `homily` — collection (references `clergyMember`; audio stored as Sanity file asset)
- `sacramentPage` — collection (7 pages: rcia, baptism, eucharist, confirmation, reconciliation, anointing, matrimony)
- `galleryAlbum` — collection (Sanity image assets; YouTube URL strings for video items)
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
```

## Out of Scope (v1.0)

No member portal, no login, no seat booking, no confession scheduling, no multilingual support, no native mobile app, no e-commerce, no automated social media cross-posting.
