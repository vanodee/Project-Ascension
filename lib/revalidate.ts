// Maps a published Sanity document `_type` to the routes the on-publish webhook
// (app/api/revalidate/route.ts) must revalidate. `siteSettings` is handled in the
// route itself — it revalidates the whole (site) layout rather than a path list.
//
// A new document type needs a `case` here AND adding to the webhook's GROQ filter
// in the Sanity dashboard (sanity.io/manage) — the filter is not in code.

export function pathsToRevalidate(type: string, slug?: string): string[] {
  switch (type) {
    case 'announcement':
      // Announcements render in a modal on '/' and '/announcements' — no dedicated
      // detail route to revalidate per-slug.
      return ['/', '/announcements'];
    case 'homily':
      // Homilies play inline from the archive via a sticky player — no dedicated
      // detail route to revalidate per-slug.
      return ['/', '/homilies'];
    case 'galleryAlbum':
      return ['/', '/gallery', ...(slug ? [`/gallery/${slug}`] : [])];
    case 'sacramentPage':
      return ['/sacraments', ...(slug ? [`/sacraments/${slug}`] : [])];
    case 'clergyMember':
      // Homily pages show the author's name via a resolved reference.
      return ['/', '/clergy', '/homilies'];
    case 'society':
      // Society name/logo is embedded via dereference on announcement & gallery cards,
      // and listed directly on the Societies page.
      return ['/', '/announcements', '/gallery', '/societies'];
    case 'recurringEvent':
    case 'parishEvent':
      // Mass/Confession times are derived from the schedule on the home, contact,
      // and livestream pages too.
      return ['/schedule', '/', '/contact', '/livestream'];
    case 'faithMonth':
    case 'faithReflection':
      // Reflections open in a modal on the index — no per-slug route.
      return ['/deepening-the-faith'];
    case 'aboutPage':
      return ['/about'];
    default:
      return [];
  }
}
