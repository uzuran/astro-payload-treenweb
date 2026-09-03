import { afterEach, describe, expect, it, vi } from 'vitest';

import { getPageBySlug, listSitemapEntries, PayloadError } from './client';

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
