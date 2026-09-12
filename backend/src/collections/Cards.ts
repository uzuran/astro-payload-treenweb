import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated';

/** A single card within a CardPack. See CardPacks.ts for the parent model. */
export const Cards: CollectionConfig = {
  slug: 'cards',
  labels: { singular: 'Card', plural: 'Cards' },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: true },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'pack', 'order', '_status'],
  },
  fields: [
    {
      name: 'pack',
      type: 'relationship',
      relationTo: 'card-packs',
      required: true,
      index: true,
      admin: { description: 'The pack this card belongs to.' },
    },
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'meaningUpright', type: 'textarea', localized: true },
    { name: 'meaningReversed', type: 'textarea', localized: true },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Display order within the pack.' },
    },
    {
      name: 'tags',
      type: 'array',
      admin: { description: 'e.g. major-arcana, cups, fire — free-form, not a fixed enum.' },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
  ],
};
