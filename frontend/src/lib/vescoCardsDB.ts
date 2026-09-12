import Dexie, { type Table } from 'dexie';

/**
 * IndexedDB cache for admin-authored card packs (CardPacks/Cards in Payload —
 * see backend/src/collections/CardPacks.ts). The tarot engine's built-in
 * 78-card deck (public/vesco/js/vesco-data.js) is separate and untouched;
 * this only serves packs loaded through vescoCardLoader.ts.
 *
 * Content is localized in Payload, so a pack/card is cached once per locale —
 * switching the site language must not show stale English text under a
 * Czech UI, or vice versa.
 */
export interface CachedCardPack {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  version: number;
  status: 'draft' | 'published';
  locale: string;
  updatedAt: string;
  cachedAt: number;
  /** See CACHE_SCHEMA_VERSION in vescoCardLoader.ts. */
  cacheSchemaVersion: number;
}

export interface CachedCard {
  id: number;
  packId: number;
  name: string;
  imageUrl: string | null;
  meaningUpright: string | null;
  meaningReversed: string | null;
  order: number;
  tags: string[];
  locale: string;
}

export interface VescoSetting {
  key: string;
  value: string;
}

export class VescoCardsDB extends Dexie {
  packs!: Table<CachedCardPack, number>;
  cards!: Table<CachedCard, number>;
  settings!: Table<VescoSetting, string>;

  constructor() {
    super('vescoCardsDB');
    this.version(1).stores({
      packs: 'id, slug, locale, updatedAt',
      cards: 'id, packId, [packId+locale], order',
      settings: 'key',
    });
  }
}

export const vescoCardsDB = new VescoCardsDB();
