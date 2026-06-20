# Project Ascension

Official website for the **Catholic Church of the Ascension**, Ikeja, Lagos, Nigeria — built with Next.js 14 App Router.

## Overview

A modern, content-driven parish website providing parishioners with easy access to mass schedules, daily readings, announcements, homilies, sacrament information, gallery, giving, and a live-stream portal.

## Tech Stack

| Concern | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | SCSS Modules (BEM) |
| CMS | Sanity (Studio + API) |
| Media | Cloudinary (images, audio, video) |
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
| `/announcements` | Parish announcements | ISR (10 min) |
| `/homilies` | Homily archive with audio | ISR (10 min) |
| `/gallery` | Photo & video albums | ISR (10 min) |
| `/schedule` | Mass & event schedule | ISR (1 hr) |
| `/readings` | Daily liturgical readings | ISR (next midnight) |
| `/livestream` | Live Sunday Mass | ISR (5 min) |
| `/give` | Online giving (Paystack) | SSG |

## Project Structure

```
app/              # Next.js App Router pages & SCSS modules
components/
  layout/         # Header, Footer
  ui/             # Reusable UI components (Button, AudioPlayer, etc.)
lib/              # Data-fetching helpers (Sanity, Google Calendar, YouTube, etc.)
styles/           # Global SCSS tokens, mixins, and base styles
public/           # Static assets (icons, placeholder images)
scripts/          # Dev utilities
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Sanity project
- API keys for Google Calendar, YouTube, Cloudinary, Paystack, and Resend

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
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_ID=
YOUTUBE_API_KEY=
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

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

The site is deployed on **Vercel**. Pushing to `main` triggers a production build automatically.

## License

Private — all rights reserved. Catholic Church of the Ascension, Ikeja, Lagos.
