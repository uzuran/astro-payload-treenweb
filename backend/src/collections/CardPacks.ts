import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated';

/**
 * A card pack (balíček) — the tarot engine's built-in 78-card deck stays
 * bundled JS (public/vesco/js/vesco-data.js), untouched. This is a separate,
 * additive system: admin-authored packs (oracle decks, alternate tarot art,
 * future numerology/astrology decks) that the frontend loads via API and
 * caches in IndexedDB. See src/lib/vescoCardLoader.ts on the frontend.
 */
export const CardPacks: CollectionConfig = {
  slug: 'card-packs',
  labels: { singular: 'Card Pack', plural: 'Card Packs' },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: true },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'version', '_status', 'updatedAt'],
  },
  endpoints: [
    {
      path: '/:id/cards',
      method: 'get',
      handler: async (req) => {
        const id = req.routeParams?.id;
        if (typeof id !== 'string') {
          return Response.json({ message: 'Missing pack id' }, { status: 400 });
        }

        // A card can individually be "published" while its pack is still
        // draft — gate on the pack's own status first, via the same
        // req/overrideAccess:false path the REST API itself uses, so an
        // anonymous caller can't route around that by hitting this endpoint.
        const pack = await req.payload
          .findByID({ collection: 'card-packs', id, depth: 0, overrideAccess: false, req })
          .catch(() => null);
        if (!pack) {
          return Response.json({ message: 'Not found' }, { status: 404 });
        }

        const cards = await req.payload.find({
          collection: 'cards',
          where: { pack: { equals: id } },
          sort: 'order',
          locale: req.locale,
          depth: 1,
          overrideAccess: false,
          req,
        });
        return Response.json(cards);
      },
    },
  ],
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL-safe identifier, e.g. "classic-tarot". Not localized.' },
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'textarea', localized: true },
    {
      name: 'version',
      type: 'number',
      defaultValue: 1,
      admin: {
        description:
          'Bump when cards change meaningfully — the frontend cache compares this to decide whether to refetch.',
      },
    },
  ],
};
