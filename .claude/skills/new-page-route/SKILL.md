---
name: new-page-route
description: Create a new Next.js App Router page for the Ascension parish website, applying the correct rendering strategy (SSG or ISR) and coding conventions.
disable-model-invocation: false
---

When asked to create a new page or route (or when `/new-page-route` is invoked with `$ARGUMENTS` naming the route), do the following:

1. **Identify the route** from `$ARGUMENTS` or the user's request. Match it against the site's IA in `ascension-parish-prd.md` if relevant.

2. **Determine the rendering strategy** using this project's rules (see the table in `CLAUDE.md`):
   - **SSG** (no `revalidate`): About, Sacraments, Clergy, Societies (list) — content changes infrequently, kept fresh by the on-publish webhook.
   - **ISR 10 min** (`revalidate: 600`): Announcements, Homilies, Gallery, Societies (detail), Home.
   - **ISR 1 h** (`revalidate: 3600`): Contact.
   - **ISR next Lagos midnight** (`revalidate: secondsUntilMidnight()` from `lib/format.ts`, with a 1 h / `3600` segment backstop): Parish Schedule, Daily Readings.
   - **ISR 1 min** (`revalidate: 60`): Livestream.

3. **Create the page file** at `app/(site)/<route>/page.tsx` (all public pages live under the `(site)` route group, sharing its Header/Footer layout). Apply these conventions:
   - Default to Server Components — no `'use client'` unless the page genuinely needs it.
   - TypeScript strict mode — no `any`, explicit return types.
   - Export `generateMetadata` for SEO (title, description, Open Graph, Twitter Card).
   - For dynamic routes (`[slug]`), also export `generateStaticParams` to pre-render known slugs at build time.
   - Fetch data inside the Server Component via a `lib/<feature>.ts` helper, not via `useEffect`.
   - If the page needs search, filtering, or other interactivity over the fetched list (see `SocietiesGrid.tsx`, `GalleryGrid.tsx`, `AnnouncementsGrid.tsx` for the established pattern), keep `page.tsx` a server component that only fetches data, and put the interactive part in a sibling `'use client'` component (e.g. `<Feature>Grid.tsx`) that owns the `useState` filter logic and renders the cards.

4. **Create the SCSS Module** at `app/(site)/<route>/page.module.scss` (plus a second module next to any client Grid component) with BEM class names. Mobile-first: base styles for mobile, `min-width` breakpoints for tablet/desktop.

5. **Wire up Sanity data fetching** if the page pulls from the CMS:
   - Add a GROQ query to `sanity/lib/queries.ts`.
   - Add a `get<Feature>()` fetch function to a `lib/<feature>.ts` helper, using the client from `sanity/lib/client.ts` and resolving images via `sanity/lib/image.ts`'s `imageUrl()`.
   - For ISR pages, use the page-level `export const revalidate = N`. SSG pages instead rely on the on-publish webhook (`app/api/revalidate/route.ts`) for freshness — check whether the new document type needs a `case` added there, and remember the webhook's own GROQ `Filter` (dashboard-only, sanity.io/manage) needs the type added too.

6. **Add the route to the sitemap** — for a new static route, append it to `STATIC_ROUTES` in `app/sitemap.ts`. Dynamic `[slug]` routes are picked up automatically if their `get<Feature>()` helper is added to the `Promise.all` there.

7. **Summarize** what was created, the rendering strategy chosen and why, and any follow-up steps (e.g., `app/sitemap.ts` entry, creating the matching Sanity schema if not yet done).
