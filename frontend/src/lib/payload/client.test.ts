import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getAnimationSettings,
  getPageBySlug,
  getSiteSettings,
  getUiLabels,
  listSitemapEntries,
  mediaUrl,
  PayloadError,
} from './client';

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('payload client', () => {
  it('returns the first doc for a slug', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          docs: [{ id: 1, title: 'Home', slug: 'home' }],
          totalDocs: 1,
        }),
      ),
    );
    const page = await getPageBySlug('home');
    expect(page?.title).toBe('Home');
  });

  it('returns null when nothing matches', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ docs: [], totalDocs: 0 })),
    );
    expect(await getPageBySlug('missing')).toBeNull();
  });

  it('throws PayloadError with status on a non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({}, { status: 500 })),
    );
    await expect(getPageBySlug('x')).rejects.toMatchObject({
      name: 'PayloadError',
      status: 500,
    });
  });

  it('throws PayloadError on an unexpected response shape', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ nope: true })),
    );
    await expect(getPageBySlug('x')).rejects.toBeInstanceOf(PayloadError);
  });

  it('maps pages + posts to sitemap paths and drops "home"', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        const href = url.toString();
        if (href.includes('/api/pages')) {
          return jsonResponse({
            docs: [
              { slug: 'home', updatedAt: '2026-01-01' },
              { slug: 'about', updatedAt: '2026-02-01' },
            ],
            totalDocs: 2,
          });
        }
        return jsonResponse({ docs: [{ slug: 'hello', updatedAt: '2026-03-01' }], totalDocs: 1 });
      }),
    );
    const entries = await listSitemapEntries();
    expect(entries.map((e) => e.path)).toEqual(['/about', '/posts/hello']);
  });
});

describe('mediaUrl', () => {
  const file = {
    url: '/api/media/file/hero.jpg',
    sizes: { hero: { url: '/api/media/file/hero-1600x2400.jpg' } },
  };

  it('resolves a relative Payload url against PUBLIC_CMS_URL', () => {
    expect(mediaUrl(file)).toBe('http://localhost:3000/api/media/file/hero.jpg');
  });

  it('prefers the requested size, falling back to the original', () => {
    expect(mediaUrl(file, 'hero')).toBe('http://localhost:3000/api/media/file/hero-1600x2400.jpg');
    expect(mediaUrl(file, 'card')).toBe('http://localhost:3000/api/media/file/hero.jpg');
  });

  it('returns null for a missing file or url', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl(undefined)).toBeNull();
    expect(mediaUrl({ url: null })).toBeNull();
  });
});

describe('globals getters', () => {
  it('omits locale by default and threads an explicit one without fallback-locale', async () => {
    const fetchMock = vi.fn(async (_url: string | URL) => jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);
    await getAnimationSettings();
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain('locale=');

    vi.stubGlobal('fetch', fetchMock);
    await getSiteSettings('cs');
    const requested = String(fetchMock.mock.calls[1]?.[0]);
    expect(requested).toContain('locale=cs');
    expect(requested).not.toContain('fallback-locale');
  });

  it('requests ui-labels at depth=0 with the locale and parses a partial payload', async () => {
    const fetchMock = vi.fn(async (_url: string | URL) =>
      jsonResponse({ header: { cta: 'Book' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const labels = await getUiLabels('en');
    const requested = String(fetchMock.mock.calls[0]?.[0]);
    expect(requested).toContain('/api/globals/ui-labels?depth=0');
    expect(requested).toContain('locale=en');
    expect(labels.header?.cta).toBe('Book');
    expect(labels.footer).toBeUndefined();
  });

  it('requests animation-settings at depth=0 and parses `duration` (present or absent)', async () => {
    const fetchMock = vi.fn(async (_url: string | URL) => jsonResponse({ duration: 2.5 }));
    vi.stubGlobal('fetch', fetchMock);
    const s = await getAnimationSettings();
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      '/api/globals/animation-settings?depth=0',
    );
    expect(s.duration).toBe(2.5);

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({})),
    );
    expect((await getAnimationSettings()).duration).toBeUndefined();
  });

  it('parses siteSettings with an optional seo group', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          siteName: 'Acme',
          seo: { titleTemplate: '{page} · {site}', defaultDescription: 'D' },
        }),
      ),
    );
    const s = await getSiteSettings('ru');
    expect(s.seo?.titleTemplate).toBe('{page} · {site}');
  });
});
