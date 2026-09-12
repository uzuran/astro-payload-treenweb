import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  cachePack,
  favoritesStorageKey,
  getActivePackId,
  getCardPack,
  getCardPacks,
  getCardsForPack,
  historyStorageKey,
  loadCachedPack,
  loadCardPack,
  setActivePackId,
} from './vescoCardLoader';
import { vescoCardsDB } from './vescoCardsDB';

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });

const PACK = {
  id: 1,
  name: 'Classic Tarot',
  slug: 'classic-tarot',
  coverImage: { url: '/media/cover.jpg' },
  description: 'desc',
  version: 1,
  _status: 'published' as const,
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const CARD = {
  id: 10,
  pack: 1,
  name: 'The Sun',
  image: { url: '/media/sun.jpg' },
  meaningUpright: 'Joy',
  meaningReversed: 'Burnout',
  order: 1,
  tags: [{ tag: 'major-arcana' }],
};

const mockFetch = (pack: typeof PACK = PACK, cards: (typeof CARD)[] = [CARD]) =>
  vi.fn(async (url: string | URL) => {
    const path = url.toString();
    if (path.includes('/cards')) return jsonResponse({ docs: cards, totalDocs: cards.length });
    return jsonResponse(pack);
  });

beforeEach(async () => {
  await vescoCardsDB.packs.clear();
  await vescoCardsDB.cards.clear();
  await vescoCardsDB.settings.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('getCardPacks / getCardPack / getCardsForPack', () => {
  it('fetches and validates the packs list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ docs: [PACK], totalDocs: 1 })),
    );
    expect(await getCardPacks('en')).toEqual([PACK]);
  });

  it('fetches a single pack', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(PACK)),
    );
    expect(await getCardPack(1, 'en')).toEqual(PACK);
  });

  it('fetches cards for a pack via the nested endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ docs: [CARD], totalDocs: 1 })),
    );
    expect(await getCardsForPack(1, 'en')).toEqual([CARD]);
  });

  it('throws on a non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({}, { status: 500 })),
    );
    await expect(getCardPack(1, 'en')).rejects.toThrow(/responded 500/);
  });
});

describe('cachePack / loadCachedPack / loadCardPack', () => {
  it('caches a pack + its cards, then reads them back from IndexedDB', async () => {
    vi.stubGlobal('fetch', mockFetch());

    await cachePack(1, 'en');

    const loaded = await loadCachedPack(1, 'en');
    expect(loaded?.pack.name).toBe('Classic Tarot');
    // Payload returns media URLs relative to the backend's own origin —
    // resolved against CMS_URL (defaults to localhost:3000 in tests), not
    // left as a bare path the frontend's own origin would swallow.
    expect(loaded?.pack.coverImageUrl).toBe('http://localhost:3000/media/cover.jpg');
    expect(loaded?.cards).toHaveLength(1);
    expect(loaded?.cards[0]).toMatchObject({
      name: 'The Sun',
      tags: ['major-arcana'],
      imageUrl: 'http://localhost:3000/media/sun.jpg',
    });
  });

  it('leaves an already-absolute image URL untouched', async () => {
    const absolutePack = { ...PACK, coverImage: { url: 'https://cdn.example.com/cover.jpg' } };
    vi.stubGlobal('fetch', mockFetch(absolutePack));
    await cachePack(1, 'en');
    const loaded = await loadCachedPack(1, 'en');
    expect(loaded?.pack.coverImageUrl).toBe('https://cdn.example.com/cover.jpg');
  });

  it('returns null for a locale that was never cached', async () => {
    vi.stubGlobal('fetch', mockFetch());
    await cachePack(1, 'en');
    expect(await loadCachedPack(1, 'cs')).toBeNull();
  });

  it('treats a cache entry from an older CACHE_SCHEMA_VERSION as not cached', async () => {
    // Simulates a browser that cached this pack before a fix to
    // toCachedPack/toCachedCard's transformation logic (e.g. the image-URL
    // bug) shipped — loadCardPack must refetch rather than keep serving the
    // stale, possibly-broken cached shape forever.
    await vescoCardsDB.packs.put({
      id: 1,
      slug: 'classic-tarot',
      name: 'Classic Tarot',
      description: null,
      coverImageUrl: '/media/cover.jpg', // the old, unresolved-origin bug
      version: 1,
      status: 'published',
      locale: 'en',
      updatedAt: PACK.updatedAt,
      cachedAt: Date.now(),
      cacheSchemaVersion: 1, // stale — current is 2
    });

    expect(await loadCachedPack(1, 'en')).toBeNull();

    vi.stubGlobal('fetch', mockFetch());
    const result = await loadCardPack(1, 'en');
    expect(result.pack.coverImageUrl).toBe('http://localhost:3000/media/cover.jpg');
  });

  it('serves the cache without refetching cards when the pack version is unchanged', async () => {
    let cardsFetchCount = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        const path = url.toString();
        if (path.includes('/cards')) {
          cardsFetchCount++;
          return jsonResponse({ docs: [CARD], totalDocs: 1 });
        }
        return jsonResponse(PACK);
      }),
    );

    await loadCardPack(1, 'en');
    expect(cardsFetchCount).toBe(1);

    await loadCardPack(1, 'en');
    expect(cardsFetchCount).toBe(1);
  });

  it('refetches when the pack version has changed server-side', async () => {
    let metaCall = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        const path = url.toString();
        if (path.includes('/cards')) return jsonResponse({ docs: [CARD], totalDocs: 1 });
        metaCall++;
        return jsonResponse({ ...PACK, version: metaCall === 1 ? 1 : 2 });
      }),
    );

    const first = await loadCardPack(1, 'en');
    expect(first.pack.version).toBe(1);

    const second = await loadCardPack(1, 'en');
    expect(second.pack.version).toBe(2);
  });

  it('falls back to the cache when the API is unreachable (offline use)', async () => {
    vi.stubGlobal('fetch', mockFetch());
    await cachePack(1, 'en');

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    const result = await loadCardPack(1, 'en');
    expect(result.pack.name).toBe('Classic Tarot');
  });

  it('replaces a pack’s cached cards wholesale on recache (a removed card does not linger)', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(PACK, [CARD, { ...CARD, id: 11, name: 'The Moon', order: 2 }]),
    );
    await cachePack(1, 'en');
    expect((await loadCachedPack(1, 'en'))?.cards).toHaveLength(2);

    vi.stubGlobal('fetch', mockFetch());
    await cachePack(1, 'en');
    expect((await loadCachedPack(1, 'en'))?.cards).toHaveLength(1);
  });

  it('falls back to a placeholder name for a pack/card untranslated in the requested (and default) locale', async () => {
    // Payload's localization fallback only reaches the site's default
    // locale — a document translated in some OTHER locale but not this one
    // or the default comes back with the field entirely absent, not null.
    const untranslatedPack = { ...PACK, name: undefined };
    const untranslatedCard = { ...CARD, name: undefined, meaningUpright: undefined };
    vi.stubGlobal('fetch', mockFetch(untranslatedPack as never, [untranslatedCard as never]));

    await cachePack(1, 'en');
    const loaded = await loadCachedPack(1, 'en');
    expect(loaded?.pack.name).toBe('classic-tarot'); // falls back to the slug
    expect(loaded?.cards[0]?.name).toBe('Card #10'); // falls back to a stable placeholder
  });
});

describe('active pack + namespaced storage keys', () => {
  it('stores and reads the active pack id', async () => {
    expect(await getActivePackId()).toBeNull();
    await setActivePackId(3);
    expect(await getActivePackId()).toBe(3);
  });

  it('namespaces favorites/history keys per pack', () => {
    expect(favoritesStorageKey(3)).toBe('vesco.pack.3.favs');
    expect(historyStorageKey(3)).toBe('vesco.pack.3.history');
  });
});
