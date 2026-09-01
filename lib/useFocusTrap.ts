'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus-management half of a modal dialog: moves focus into `containerRef`
 * while `active`, keeps Tab/Shift+Tab cycling among the container's own
 * focusable elements (so focus can't escape to the page behind it), and
 * restores focus to whatever had it beforehand once `active` goes false.
 *
 * `role="dialog"`/`aria-modal="true"` on the container is a promise to
 * assistive tech that this is what happens — this hook is what actually
 * keeps that promise. Shared by every full-screen overlay in the app
 * (`HomilyInfoOverlay`, `AnnouncementModal`, `AlbumLightbox`) so the
 * behavior stays identical across all three rather than drifting.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean): void {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const getFocusable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    // Prefer the first focusable element (the close button, in every current
    // usage) over the container itself, so Tab/Shift+Tab has an immediate,
    // sensible position to cycle from.
    (getFocusable()[0] ?? container).focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab') return;
      const items = getFocusable();
      const [first] = items;
      const last = items.at(-1);
      if (!first || !last) return;
      const current = document.activeElement;

      if (event.shiftKey) {
        if (current === first || !container.contains(current)) {
          event.preventDefault();
          last.focus();
        }
      } else if (current === last || !container.contains(current)) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [active, containerRef]);
}
