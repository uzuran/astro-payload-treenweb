import { z } from 'zod';

import {
  vescoCardsDB,
  type CachedCard,
  type CachedCardPack,
  type VescoCardsDB,
} from './vescoCardsDB';

/**
 * Client-side loader for admin-authored card packs. Runs in the browser
 * (fetch + IndexedDB), unlike lib/payload/client.ts which is SSR-only — so it
 * reads the browser-exposed PUBLIC_CMS_URL directly rather than the
 * server-only PAYLOAD_INTERNAL_URL. Bundled by Vite (it needs `dexie`, an npm
 * package, and real TypeScript) — a first for Vesco's client runtime, whose
 * engine is deliberately classic, unbundled scripts. Bridges the two worlds
 * by exposing itself on `window.VescoCardLoader` at the bottom of this file,
 * the same way vesco-data.js/vesco-cs.js expose window.VescoData/VescoCS.
 */

const CMS_URL = (import.meta.env.PUBLIC_CMS_URL as string | undefined) ?? 'http://localhost:3000';
const TIMEOUT_MS = 8_000;

/**
 * Bump whenever toCachedPack/toCachedCard's transformation logic changes.
 * loadCardPack's cache-freshness check only compares the CMS pack's own
 * `version` field — that has no reason to change just because a client-side
 * bug in how we cache its data got fixed, so a browser with an
 * already-cached (and possibly buggy) entry would otherwise keep serving it
 * forever. loadCachedPack treats a mismatch as "not cached".
 */
const CACHE_SCHEMA_VERSION = 2;

export class VescoCardLoaderError extends Error {}

async function fetchJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(new URL(path, CMS_URL), {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!res.ok) {
      throw new VescoCardLoaderError(`Payload responded ${res.status} for ${path}`);
    }
    const json: unknown = await res.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new VescoCardLoaderError(`Unexpected response for ${path}: ${parsed.error.message}`);
    }
    return parsed.data;
  } catch (err) {
    if (err instanceof VescoCardLoaderError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new VescoCardLoaderError(`Request timed out after ${TIMEOUT_MS}ms for ${path}`);
    }
    throw new VescoCardLoaderError(`Request failed for ${path}: ${String(err)}`);
  } finally {
    clearTimeout(timer);
  }
}

const mediaSchema = z.object({ url: z.string().nullish() });
const imageRefSchema = z.union([z.number(), mediaSchema, z.null()]).optional();

const cardPackSchema = z.object({
  id: z.number(),
  // Localized, and Payload's fallback only reaches the *default* locale — a
  // pack/card translated in one locale but not the site's default (and not
  // the one being requested) comes back with no value at all. Tolerate that
  // instead of failing the whole fetch over one untranslated document.
  name: z.string().nullish(),
  slug: z.string(),
  coverImage: imageRefSchema,
  description: z.string().nullish(),
  version: z.number().nullish(),
  _status: z.enum(['draft', 'published']).nullish(),
  updatedAt: z.string(),
});
export type CardPack = z.infer<typeof cardPackSchema>;

const cardSchema = z.object({
  id: z.number(),
  pack: z.union([z.number(), z.object({ id: z.number() })]),
  name: z.string().nullish(),
  image: imageRefSchema,
  meaningUpright: z.string().nullish(),
  meaningReversed: z.string().nullish(),
  order: z.number().nullish(),
  tags: z.array(z.object({ tag: z.string() })).nullish(),
});
export type Card = z.infer<typeof cardSchema>;

const listSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ docs: z.array(item), totalDocs: z.number() });

const localeQS = (locale: string) => `locale=${encodeURIComponent(locale)}`;

/** All packs (published only, for an anonymous visitor). */
export async function getCardPacks(locale = 'en'): Promise<CardPack[]> {
  const data = await fetchJson(
    `/api/card-packs?${localeQS(locale)}&depth=1&limit=100`,
    listSchema(cardPackSchema),
  );
  return data.docs;
}

export async function getCardPack(id: number, locale = 'en'): Promise<CardPack> {
  return fetchJson(`/api/card-packs/${id}?${localeQS(locale)}&depth=1`, cardPackSchema);
}

/** Via CardPacks' custom nested endpoint (backend/src/collections/CardPacks.ts). */
export async function getCardsForPack(id: number, locale = 'en'): Promise<Card[]> {
  const data = await fetchJson(
    `/api/card-packs/${id}/cards?${localeQS(locale)}&depth=1&limit=500`,
    listSchema(cardSchema),
  );
  return data.docs;
}

function imageUrl(ref: number | { url?: string | null } | null | undefined): string | null {
  if (!ref || typeof ref !== 'object' || !ref.url) return null;
  // Payload returns media URLs relative to the backend's own origin
  // (/api/media/file/...) — resolve against CMS_URL, not the page's origin
  // (the frontend), or the browser looks for it on the wrong host.
  return new URL(ref.url, CMS_URL).toString();
}

function toCachedPack(pack: CardPack, locale: string): CachedCardPack {
  return {
    id: pack.id,
    slug: pack.slug,
    // Untranslated in this locale (and the site default) — fall back to the
    // slug rather than showing nothing.
    name: pack.name ?? pack.slug,
    description: pack.description ?? null,
    coverImageUrl: imageUrl(pack.coverImage),
    version: pack.version ?? 1,
    status: pack._status ?? 'published',
    locale,
    updatedAt: pack.updatedAt,
    cachedAt: Date.now(),
    cacheSchemaVersion: CACHE_SCHEMA_VERSION,
  };
}

function toCachedCard(card: Card, locale: string): CachedCard {
  return {
    id: card.id,
    packId: typeof card.pack === 'number' ? card.pack : card.pack.id,
    // Untranslated in this locale (and the site default) — fall back to a
    // stable placeholder rather than showing nothing.
    name: card.name ?? `Card #${card.id}`,
    imageUrl: imageUrl(card.image),
    meaningUpright: card.meaningUpright ?? null,
    meaningReversed: card.meaningReversed ?? null,
    order: card.order ?? 0,
    tags: (card.tags ?? []).map((t) => t.tag),
    locale,
  };
}

/** Fetches a pack + its cards from the API and (over)writes the cache for it. */
export async function cachePack(id: number, locale = 'en'): Promise<void> {
  const [pack, cards] = await Promise.all([getCardPack(id, locale), getCardsForPack(id, locale)]);
  await vescoCardsDB.transaction('rw', [vescoCardsDB.packs, vescoCardsDB.cards], async () => {
    await vescoCardsDB.packs.put(toCachedPack(pack, locale));
    // Replace this pack's cards for this locale wholesale, so a card
    // removed on the backend doesn't linger in the cache forever.
    await vescoCardsDB.cards
      .where('packId')
      .equals(id)
      .and((c) => c.locale === locale)
      .delete();
    await vescoCardsDB.cards.bulkPut(cards.map((c) => toCachedCard(c, locale)));
  });
}

export interface LoadedPack {
  pack: CachedCardPack;
  cards: CachedCard[];
}

/** Cache-only read — null if this pack/locale was never cached (or was
 * cached under an older CACHE_SCHEMA_VERSION). */
export async function loadCachedPack(id: number, locale = 'en'): Promise<LoadedPack | null> {
  const pack = await vescoCardsDB.packs.get(id);
  if (!pack || pack.locale !== locale || pack.cacheSchemaVersion !== CACHE_SCHEMA_VERSION) {
    return null;
  }
  const cards = await vescoCardsDB.cards
    .where('packId')
    .equals(id)
    .and((c) => c.locale === locale)
    .sortBy('order');
  if (cards.length === 0) return null;
  return { pack, cards };
}

/**
 * The main entry point. Cache-first: if a cached copy exists, does one cheap
 * metadata fetch to compare `version` before deciding whether to refetch the
 * full card list. Falls back to the cache (offline-friendly) if that check
 * itself fails to reach the API.
 */
export async function loadCardPack(id: number, locale = 'en'): Promise<LoadedPack> {
  const existing = await loadCachedPack(id, locale);
  if (existing) {
    try {
      const fresh = await getCardPack(id, locale);
      if (fresh.version === existing.pack.version) return existing;
    } catch {
      return existing;
    }
  }
  await cachePack(id, locale);
  const reloaded = await loadCachedPack(id, locale);
  if (!reloaded) throw new VescoCardLoaderError(`Failed to load card pack ${id}`);
  return reloaded;
}

const ACTIVE_PACK_KEY = 'activePackId';

export async function getActivePackId(): Promise<number | null> {
  const row = await vescoCardsDB.settings.get(ACTIVE_PACK_KEY);
  return row ? Number(row.value) : null;
}

export async function setActivePackId(id: number): Promise<void> {
  await vescoCardsDB.settings.put({ key: ACTIVE_PACK_KEY, value: String(id) });
}

/**
 * Namespaced localStorage keys for a pack's favorites/history — so if/when
 * the tarot engine (public/vesco/js/*) is wired to a loaded pack, its
 * existing localStorage-based favorites logic (see app.js's FAV_KEY) can
 * keep packs from bleeding into each other's saved state without changing
 * how that engine stores anything.
 */
export function favoritesStorageKey(packId: number): string {
  return `vesco.pack.${packId}.favs`;
}
export function historyStorageKey(packId: number): string {
  return `vesco.pack.${packId}.history`;
}

export const vescoCardLoader = {
  getCardPacks,
  getCardPack,
  getCardsForPack,
  cachePack,
  loadCachedPack,
  loadCardPack,
  getActivePackId,
  setActivePackId,
  favoritesStorageKey,
  historyStorageKey,
};

declare global {
  interface Window {
    VescoCardLoader?: typeof vescoCardLoader;
  }
}

if (typeof window !== 'undefined') {
  window.VescoCardLoader = vescoCardLoader;
  // This is a Vite module script — the browser always defers it until after
  // the document is parsed, so it runs AFTER the classic (is:inline)
  // page-*.js scripts placed earlier in <body>. Anything wanting to use
  // window.VescoCardLoader on page load can't assume it's there yet; it can
  // listen for this instead of polling.
  window.dispatchEvent(new CustomEvent('vesco:cardloader-ready'));
}

export type { CachedCard, CachedCardPack, VescoCardsDB };
export default vescoCardLoader;
