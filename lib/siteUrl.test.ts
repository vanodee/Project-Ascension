import { afterEach, describe, it, expect, vi } from 'vitest';

// SITE_URL is resolved once at module load, so each case stubs the env and
// re-imports a fresh copy of the module.

async function loadSiteUrl(): Promise<string> {
  vi.resetModules();
  const mod = await import('./siteUrl');
  return mod.SITE_URL;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('SITE_URL', () => {
  it('prefers NEXT_PUBLIC_SITE_URL and strips trailing slashes', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.ccoaikeja.org//');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'ascension.vercel.app');
    expect(await loadSiteUrl()).toBe('https://www.ccoaikeja.org');
  });

  it('falls back to the Vercel production domain over https', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'ascension.vercel.app');
    expect(await loadSiteUrl()).toBe('https://ascension.vercel.app');
  });

  it('falls back to localhost when neither is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
    expect(await loadSiteUrl()).toBe('http://localhost:3000');
  });
});
