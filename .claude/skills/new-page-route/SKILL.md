---
name: new-page-route
description: Create a new Next.js App Router page for the Ascension parish website, applying the correct rendering strategy (SSG or ISR) and coding conventions.
disable-model-invocation: false
---

When asked to create a new page or route (or when `/new-page-route` is invoked with `$ARGUMENTS` naming the route), do the following:

1. **Identify the route** from `$ARGUMENTS` or the user's request. Match it against the site's IA in `ascension-parish-prd.md` if relevant.

2. **Determine the rendering strategy** using this project's rules:
   - **SSG** (no `revalidate`): About, Sacraments, Clergy, Contact — content changes infrequently, managed in Sanity.
   - **ISR 10 min** (`revalidate: 600`): Announcements, Homilies, Gallery.
   - **ISR 1 hour** (`revalidate: 3600`): Parish Schedule (Google Calendar).
   - **ISR next midnight**: Daily Readings (Universalis) — calculate seconds until next midnight for `revalidate`.
   - **ISR 5 min** (`revalidate: 300`): Livestream.

3. **Create the page file** at `app/<route>/page.tsx`. Apply these conventions:
   - Default to Server Components — no `'use client'` unless the page genuinely needs it (almost never for these pages).
   - TypeScript strict mode — no `any`, explicit return types.
   - Export `generateMetadata` for SEO (title, description, Open Graph, Twitter Card).
   - For dynamic routes (`[slug]`), also export `generateStaticParams` to pre-render known slugs at build time.
   - Fetch data inside the Server Component (or a `lib/` helper), not via `useEffect`.

4. **Create the SCSS Module** at `app/<route>/page.module.scss` with BEM class names. Mobile-first: base styles for mobile, `min-width` breakpoints for tablet/desktop.

5. **Wire up Sanity data fetching** if the page pulls from the CMS:
   - Use the Sanity client from `lib/sanity.ts` (or wherever it is defined in the project).
   - Use GROQ queries.
   - For ISR pages, pass the `next: { revalidate: N }` option in the fetch or use the page-level `export const revalidate = N`.

6. **Summarize** what was created, the rendering strategy chosen and why, and any follow-up steps (e.g., adding the route to `next-sitemap` config, creating the matching Sanity schema if not yet done).
