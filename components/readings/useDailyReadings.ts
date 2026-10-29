'use client';

import { useEffect, useState } from 'react';
import type { DayReadings } from '@/lib/types';
import { lagosToday } from '@/lib/format';
import {
  mapUniversalisPayload,
  universalisScriptUrl,
  type UniversalisPayload,
} from '@/lib/readings';

// Universalis's JSONP feed may only be loaded by the visitor's browser — it
// returns 403 to server-side fetches (see lib/readings.ts). The script it serves
// calls a fixed global, `universalisCallback(payload)`.

declare global {
  interface Window {
    universalisCallback?: (payload: UniversalisPayload) => void;
  }
}

const TIMEOUT_MS = 8000;
const STORAGE_KEY = 'ascension:universalis-mass';

// One in-flight load per date, shared by every component on the page and kept
// across client-side navigations (home → /readings reuses the same result).
const loads = new Map<string, Promise<UniversalisPayload>>();

function readStored(date: string): UniversalisPayload | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as { date?: string; payload?: UniversalisPayload };
    return stored.date === date && stored.payload ? stored.payload : null;
  } catch {
    return null;
  }
}

function writeStored(date: string, payload: UniversalisPayload): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ date, payload }));
  } catch {
    // Storage full or blocked — the cache is only a convenience.
  }
}

function injectScript(date: string): Promise<UniversalisPayload> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    let settled = false;

    const settle = (outcome: () => void): void => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      // Leave a no-op behind so a script arriving after the timeout doesn't throw.
      window.universalisCallback = () => {};
      script.remove();
      outcome();
    };

    const timer = window.setTimeout(
      () => settle(() => reject(new Error('Universalis timed out'))),
      TIMEOUT_MS,
    );
    window.universalisCallback = (payload) => settle(() => resolve(payload));
    script.onerror = () => settle(() => reject(new Error('Universalis script failed to load')));
    script.src = universalisScriptUrl(date);
    script.async = true;
    document.body.appendChild(script);
  });
}

function loadPayload(date: string): Promise<UniversalisPayload> {
  const existing = loads.get(date);
  if (existing) return existing;

  const stored = readStored(date);
  const load = stored
    ? Promise.resolve(stored)
    : injectScript(date).then((payload) => {
        // Don't pin an empty/unexpected payload for the rest of the day.
        if (payload.Mass_G) writeStored(date, payload);
        return payload;
      });
  // Forget failures so a later mount (or navigation) tries again.
  load.catch(() => loads.delete(date));
  loads.set(date, load);
  return load;
}

export type DailyReadingsState =
  | { status: 'loading'; date: string }
  | { status: 'ready'; date: string; data: DayReadings }
  | { status: 'error'; date: string };

/**
 * Loads today's Universalis readings in the browser. `serverDate` is the Lagos
 * date the page was rendered for; it is used for the first render (so hydration
 * matches) and replaced by the browser's own Lagos date once the load settles —
 * an ISR page cached just before midnight still shows the new day's readings.
 */
export function useDailyReadings(serverDate: string): DailyReadingsState {
  const [state, setState] = useState<DailyReadingsState>({ status: 'loading', date: serverDate });

  useEffect(() => {
    let cancelled = false;
    const date = lagosToday();
    loadPayload(date)
      .then((payload) => {
        if (cancelled) return;
        const data = mapUniversalisPayload(payload);
        setState(
          data.readings.length > 0 ? { status: 'ready', date, data } : { status: 'error', date },
        );
      })
      .catch((err: unknown) => {
        console.error('[universalis] load error:', err);
        if (!cancelled) setState({ status: 'error', date });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
