import { describe, it, expect } from 'vitest';
import { pathsToRevalidate } from './revalidate';

// Locks down which routes each published `_type` refreshes. A wrong or missing
// path here means editors publish in Studio and the site silently stays stale
// until the ISR timer (or forever, for SSG pages).

describe('pathsToRevalidate', () => {
  it('appends the detail route for slugged types', () => {
    expect(pathsToRevalidate('galleryAlbum', 'harvest-2025')).toEqual([
      '/',
      '/gallery',
      '/gallery/harvest-2025',
    ]);
    expect(pathsToRevalidate('sacramentPage', 'baptism')).toEqual([
      '/sacraments',
      '/sacraments/baptism',
    ]);
  });

  it('omits the detail route when the payload has no slug', () => {
    expect(pathsToRevalidate('galleryAlbum')).toEqual(['/', '/gallery']);
    expect(pathsToRevalidate('sacramentPage')).toEqual(['/sacraments']);
  });

  it('never revalidates per-slug routes for modal/inline types', () => {
    expect(pathsToRevalidate('announcement', 'mass-change')).toEqual(['/', '/announcements']);
    expect(pathsToRevalidate('homily', 'easter-vigil')).toEqual(['/', '/homilies']);
  });

  it('refreshes the Deepening the Faith index for themes and reflections', () => {
    expect(pathsToRevalidate('faithMonth')).toEqual(['/deepening-the-faith']);
    expect(pathsToRevalidate('faithReflection', 'who-is-saint-francis')).toEqual([
      '/deepening-the-faith',
    ]);
  });

  it('refreshes every page that dereferences a society', () => {
    expect(pathsToRevalidate('society')).toEqual([
      '/',
      '/announcements',
      '/gallery',
      '/societies',
    ]);
  });

  it('refreshes every page that derives Mass times from the schedule', () => {
    const expected = ['/schedule', '/', '/contact', '/livestream'];
    expect(pathsToRevalidate('recurringEvent')).toEqual(expected);
    expect(pathsToRevalidate('parishEvent')).toEqual(expected);
  });

  it('covers the remaining document types', () => {
    expect(pathsToRevalidate('clergyMember')).toEqual(['/', '/clergy', '/homilies']);
    expect(pathsToRevalidate('aboutPage')).toEqual(['/about']);
  });

  it('returns nothing for unknown types', () => {
    expect(pathsToRevalidate('somethingNew')).toEqual([]);
  });
});
