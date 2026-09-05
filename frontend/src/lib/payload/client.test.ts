import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getHero,
  getPageBySlug,
  getSiteSettings,
  listMasters,
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

describe('globals + masters getters', () => {
  it('parses the hero global and exposes a populated photo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          headingLine1: 'ТВОЯ ФОРМА.',
          headingAccent: 'ТВОЙ ХАРАКТЕР.',
          photo: { url: '/api/media/file/hero.jpg', alt: 'x' },
        }),
      ),
    );
    const hero = await getHero();
    expect(hero.headingLine1).toBe('ТВОЯ ФОРМА.');
    expect(mediaUrl(hero.photo)).toBe('http://localhost:3000/api/media/file/hero.jpg');
  });

  it('requests hero at depth=1 and omits locale by default', async () => {
    const fetchMock = vi.fn(async (_url: string | URL) => jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);
    await getHero();
    const requested = String(fetchMock.mock.calls[0]?.[0]);
    expect(requested).toContain('/api/globals/hero?depth=1');
    expect(requested).not.toContain('locale=');
  });

  it('threads an explicit locale through to the query string', async () => {
    const fetchMock = vi.fn(async (_url: string | URL) => jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);
    await getSiteSettings('cs');
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('locale=cs&fallback-locale=null');
  });

  it('returns the masters docs array sorted by the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          docs: [
            { id: 1, name: 'Алекс', order: 1 },
            { id: 2, name: 'Марк', order: 2 },
          ],
          totalDocs: 2,
        }),
      ),
    );
    const masters = await listMasters();
    expect(masters.map((m) => m.name)).toEqual(['Алекс', 'Марк']);
  });
});
