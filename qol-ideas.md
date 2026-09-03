# QOL Ideas

Backlog of quality-of-life improvements to revisit later. Not scheduled — pick from here as time allows.

## Homilies

- [ ] **Media Session API integration** — lock-screen/notification/Bluetooth play-pause-skip controls. Biggest gap between this and a "real" audio player, given people will listen on phones.
- [ ] **Download/offline link** for the audio file — genuinely relevant given the parish's Lagos bandwidth context.
- [ ] **Auto-advance** to the next homily in the filtered list when one finishes playing.
- [ ] **Playback speed control** (0.75×/1×/1.25×/1.5×) — standard on podcast/sermon players.
- [ ] **"Clear filters" affordance** — this page now has the most filter dimensions on the site (search + priest + season + date range).
- [ ] **Remember playback position** across visits (localStorage) — lower priority, optional.

## Announcements

- [ ] **Surface `eventDate` on the list card itself** (small badge/line, same idea as Gallery's date-forward card design) — right now `eventDate`/`eventLocation` only show once you open an announcement's modal, so there's no way to scan the grid for "what's happening this weekend" without opening cards one by one.
- [ ] **"Add to calendar" link** on event-type announcements (anything with `eventDate` set) — a simple `.ics` or "Add to Google Calendar" link. Would also pair well with the `/schedule` page's `parishEvent` entries.
- [ ] **Sort/filter by `eventDate`** as an alternative to the default pinned/publishedAt order — for "what's coming up" browsing rather than "what was posted recently."
- [ ] **Search includes society name** — right now the search box covers title/excerpt/location/body only; finding a society's announcements only works via the dedicated Society filter dropdown, not by typing the society's name into search. Low priority since the filter already covers this.

## Gallery

- [x] ~~**Fix video playback**~~ — done differently: video support (`videoItem`, YouTube embed) was scoped in the PRD but never actually implemented end-to-end. The schema offered a `videoItem` type (YouTube URL + caption), and `next.config.ts` even allow-listed `i.ytimg.com` as an image host — strong evidence a YouTube-thumbnail derivation was planned — but `lib/gallery.ts` never derived a thumbnail for video items, and `AlbumLightbox.tsx` rendered *every* media item (image or video) as `<Image src={item.url}>` with no branch on type, so a video item's raw YouTube watch URL got handed to `next/image` as if it were a photo. There was also no playback path anywhere (no iframe/embed), even though the codebase already has that exact idiom in `app/(site)/livestream/page.tsx` (`https://www.youtube-nocookie.com/embed/${videoId}`). Confirmed via a live audit that no existing `galleryAlbum` document had a `videoItem` in it, so **video support was removed entirely** rather than fixed: `videoItem` is gone from the `galleryAlbum` schema, `GALLERY_ALBUMS_QUERY`/`GALLERY_ALBUM_QUERY` now defensively filter `media[_type == "imageItem"]`, `GalleryMediaItem` dropped its `type` discriminator, and the PRD (`ascension-parish-prd.md`) was updated to describe Gallery as photos-only. If video support is wanted later, it should be built as a fresh, complete feature (thumbnail derivation + an actual embedded player reusing the livestream iframe idiom), not resurrected from this dead code.
- [ ] **Swipe gestures in the lightbox** on mobile — arrow buttons and keyboard (←/→) both work today, but there's no touch swipe to advance photos, which matters a lot given a parish audience is mostly on phones.
- [ ] **Download link for photos** in the lightbox — Sanity CDN URLs are already public; parishioners saving a photo of themselves/family from an event is a real, low-effort win.
- [ ] **Search includes society name** — same gap as Announcements' search box above; low priority since the Society filter dropdown already covers it.

## Homepage

### "Quick updates" — the three cards under the Mass-times strip

> **⚠️ Temporary — delete this whole subsection once the section's direction is decided.**
> These are brainstorm notes for replacing the placeholder cards, not a standing
> backlog. When the call is made, implement it and remove everything here.

**The problem.** The three `.quick-updates__card`s in `app/(site)/page.tsx` were
built as placeholders for dynamic content that never materialised:

- **"This Sunday · The Most Holy Trinity"** — feast name and body are string
  literals; stale since Trinity Sunday 2026.
- **"Latest Homily"** — genuinely dynamic (`getHomilies()[0]`), but uses a generic
  `card-homily.png`. The only card that works.
- **"Announcements" (`HomeAnnouncementCard`)** — pinned to a hardcoded slug
  (`corpus-christi-procession`), generic `card-announcement.png`, and it repeats
  the Announcements panel rendered immediately below it.

Two structural issues: (1) no CMS source produces a tall ~520px editorial image
for this format, and (2) two of the three cards echo content that reappears lower
on the page.

**Content ideas (if the 3-tall-card format stays):**

_Time-sensitive — best fit for the slot right after the hero:_

- [ ] **Livestream status card** — `getLivestreamStatus()` already returns
  `{isLive, videoId, title, viewerCount}`. "● LIVE NOW" when live, "Next
  livestream: Sunday 11 AM" otherwise. Only surfaced today as a hero button.
  Caveat: homepage ISR is 600s, so "LIVE" can lag 10 min — shorten `revalidate`
  or make it a small client fetch.
- [ ] **"This week at Ascension"** — next 7–14 days of `parish_event` +
  `celebration` from `expandEvents()`. The calendar is otherwise invisible on the
  homepage (the Mass strip only shows recurring Masses). Highest additive value.
- [ ] **Liturgical day / coming Sunday** — `getDailyReadings()` gives
  `celebrations[]`, `season`, `colourVar`, `lectionaryYear`. "This Sunday: 23rd
  Sunday in Ordinary Time," accented with the real liturgical colour. What card 1
  was trying to be.
- [ ] **Confession & Adoration this week** — `getScheduleWeek().confession` +
  adoration recurring events.
- [ ] **Next Holy Day / solemnity** — derived from `lib/liturgical.ts`. Seasonal
  urgency ("Assumption — Fri 15 Aug · Masses 6:30 AM & 6 PM").

_Evergreen:_

- [ ] **Latest homily** — keep it, but use the priest's `clergy` portrait as the
  card image instead of the generic PNG.
- [ ] **Newest gallery album** — "Recently at the parish: [title]" with
  `album.coverImage` as the card art → `/gallery/[slug]`. Real photography, no new
  CMS surface.
- [ ] **"New here? / Planning a visit"** — Mass times, parking, what to expect →
  `/about`. Nothing on the homepage speaks to first-time visitors.
- [ ] **RCIA invitation** — currently only at the very bottom of the page, though
  "grow RCIA inquiries" is a PRD goal.
- [ ] **Society spotlight** — rotate `getSocieties()` by ISO week number (stable
  per week, no upkeep). Logo on the society colour → `/societies/[slug]`.
- [ ] **Mission statement / scripture quote** — `aboutPage.missionStatement` or
  `scriptureQuote`; purely typographic, no photo needed.
- [ ] **Prayer requests / Mass intentions** — needs a Tally form; high pastoral
  value.
- [ ] **Weekly bulletin / newsletter** link or download, if the parish produces one.
- [ ] **"Need a priest?"** — sacramental emergencies, hospital/home visits →
  `/contact`.
- [ ] **Giving** — when `/give` is re-enabled.

Coherent trio if keeping three cards: **Livestream · This Week's events · Latest
homily** — all backed by existing data, none repeating another section.

**Fixing the imagery gap:**

- [ ] **A — `homeFeature` array in Sanity** — staff curate 2–3 cards
  `{label, title, blurb, image, ctaText, ctaHref}`. Most flexible, but the current
  failure mode _is_ staleness, and this rebuilds that risk. Only worth it if
  someone will refresh it weekly.
- [ ] **B — borrow images from content that already has them** — gallery covers,
  clergy portraits, society logos/colours. No new CMS fields.
- [ ] **C — drop photos from cards that can't source them** — liturgical-colour
  block + serif type for the feast card, priest photo for the homily card, pure
  type for a scripture card.

**Design pivots (if the 3-tall-card format is abandoned):**

- [ ] **"This Week at Ascension" band** — one full-width panel: today's liturgical
  day (colour accent) + the next 3–5 dated events + "Full schedule →". No images.
  Rhymes with the Mass-times strip directly above it. Lowest maintenance, highest
  density. _Recommended._
- [ ] **Two cards instead of three** — Worship (livestream + this Sunday) and
  Homily. Half the slots to fill.
- [ ] **One editable "Featured" banner** — image-left / text-right, same shape as
  "Discover the Life of Our Parish" and the RCIA band lower down; creates a 3-beat
  rhythm down the page. One `homeFeature` singleton.
- [ ] **Slim liturgical "Today" strip** — one-line band tinted with the day's
  liturgical colour ("Ordinary Time · Thursday, Week 22 · Today's Readings →").
  Fully automatic; transitions into the Readings section it introduces.
- [ ] **Fold into Readings & Announcements** — make that block three columns
  (Readings / Announcements / This Week or Homily). Deletes a whole section; stops
  the homepage repeating itself.
- [ ] **Quick-links tile row** — Readings · Schedule · Livestream · Homilies ·
  Societies · Give. Pure wayfinding, no imagery, strong on mobile.
- [ ] **Horizontal photo rail** — "Life at Ascension," scroll-snapping recent
  gallery photos → `/gallery`. Solves imagery but duplicates the Gallery section
  unless that's also cut or moved.

**Recommendation.** The failure is staleness, so avoid anything needing staff
curation. Primary: the "This Week" band or the liturgical "Today" strip, plus a
single auto-updating "Latest homily" card. If the current visual language is kept:
three cards = Livestream / This Week's events / Latest homily, with optional
per-card image fields (fallback: liturgical colour or clergy photo), never generic
PNGs. Build the `homeFeature` CMS rail only if the parish will maintain it.

## Cross-cutting

- [x] **Modal/overlay focus management** — `HomilyInfoOverlay`, `AnnouncementModal`, and `AlbumLightbox` shared the same `role="dialog"` pattern with no focus trap and no initial focus moved into the dialog on open, so `aria-modal="true"` wasn't backed by real behavior: a keyboard user's Tab order still ran into the page content sitting behind the (visually hidden) dialog, and closing never returned focus to whatever opened it. Fixed with one shared hook, `lib/useFocusTrap.ts` (`useFocusTrap(containerRef, active)`), wired identically into all three: on open it moves focus to the dialog's first focusable element (the close button in every case), keeps Tab/Shift+Tab cycling only among the dialog's own focusable elements (wrapping at both ends) so focus can't escape to the page behind it, and restores focus to whatever had it before the dialog opened once it closes — regardless of whether it was closed via Escape, the close button, or the backdrop. Verified live: Tab from the close button lands on the next focusable element inside the dialog and wraps back to the close button; Shift+Tab from the close button wraps to the last element; closing via Escape returns focus to the exact row/thumbnail that opened it.
