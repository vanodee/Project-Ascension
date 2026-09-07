// Canonical origin of the deployed site — used for metadataBase, the sitemap,
// and robots.txt.
//
// Production runs on the parish's custom domain, https://www.ccoaikeja.org, set
// via NEXT_PUBLIC_SITE_URL in Vercel (Production) and .env.local. Resolution order:
//   1. NEXT_PUBLIC_SITE_URL      — the canonical custom domain (https://www.ccoaikeja.org)
//   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's stable production domain (preview/build fallback)
//   3. http://localhost:3000    — local dev / CI
//
// See CLAUDE.md → "Going live on a custom domain" for the switch-over checklist.
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl();
