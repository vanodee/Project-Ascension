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
- [ ] **"Add to calendar" link** on event-type announcements (anything with `eventDate` set) — a simple `.ics` or "Add to Google Calendar" link, natural pairing with the parish's existing Google Calendar-based Parish Schedule feature.
- [ ] **Sort/filter by `eventDate`** as an alternative to the default pinned/publishedAt order — for "what's coming up" browsing rather than "what was posted recently."
- [ ] **Search includes society name** — right now the search box covers title/excerpt/location/body only; finding a society's announcements only works via the dedicated Society filter dropdown, not by typing the society's name into search. Low priority since the filter already covers this.

## Gallery

- [x] ~~**Fix video playback**~~ — done differently: video support (`videoItem`, YouTube embed) was scoped in the PRD but never actually implemented end-to-end. The schema offered a `videoItem` type (YouTube URL + caption), and `next.config.ts` even allow-listed `i.ytimg.com` as an image host — strong evidence a YouTube-thumbnail derivation was planned — but `lib/gallery.ts` never derived a thumbnail for video items, and `AlbumLightbox.tsx` rendered *every* media item (image or video) as `<Image src={item.url}>` with no branch on type, so a video item's raw YouTube watch URL got handed to `next/image` as if it were a photo. There was also no playback path anywhere (no iframe/embed), even though the codebase already has that exact idiom in `app/(site)/livestream/page.tsx` (`https://www.youtube-nocookie.com/embed/${videoId}`). Confirmed via a live audit that no existing `galleryAlbum` document had a `videoItem` in it, so **video support was removed entirely** rather than fixed: `videoItem` is gone from the `galleryAlbum` schema, `GALLERY_ALBUMS_QUERY`/`GALLERY_ALBUM_QUERY` now defensively filter `media[_type == "imageItem"]`, `GalleryMediaItem` dropped its `type` discriminator, and the PRD (`ascension-parish-prd.md`) was updated to describe Gallery as photos-only. If video support is wanted later, it should be built as a fresh, complete feature (thumbnail derivation + an actual embedded player reusing the livestream iframe idiom), not resurrected from this dead code.
- [ ] **Swipe gestures in the lightbox** on mobile — arrow buttons and keyboard (←/→) both work today, but there's no touch swipe to advance photos, which matters a lot given a parish audience is mostly on phones.
- [ ] **Download link for photos** in the lightbox — Sanity CDN URLs are already public; parishioners saving a photo of themselves/family from an event is a real, low-effort win.
- [ ] **Search includes society name** — same gap as Announcements' search box above; low priority since the Society filter dropdown already covers it.

## Cross-cutting

- [x] **Modal/overlay focus management** — `HomilyInfoOverlay`, `AnnouncementModal`, and `AlbumLightbox` shared the same `role="dialog"` pattern with no focus trap and no initial focus moved into the dialog on open, so `aria-modal="true"` wasn't backed by real behavior: a keyboard user's Tab order still ran into the page content sitting behind the (visually hidden) dialog, and closing never returned focus to whatever opened it. Fixed with one shared hook, `lib/useFocusTrap.ts` (`useFocusTrap(containerRef, active)`), wired identically into all three: on open it moves focus to the dialog's first focusable element (the close button in every case), keeps Tab/Shift+Tab cycling only among the dialog's own focusable elements (wrapping at both ends) so focus can't escape to the page behind it, and restores focus to whatever had it before the dialog opened once it closes — regardless of whether it was closed via Escape, the close button, or the backdrop. Verified live: Tab from the close button lands on the next focusable element inside the dialog and wraps back to the close button; Shift+Tab from the close button wraps to the last element; closing via Escape returns focus to the exact row/thumbnail that opened it.
