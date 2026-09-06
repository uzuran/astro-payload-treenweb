import type { CollectionConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

export const Masters: CollectionConfig = {
  slug: 'masters',
  labels: { singular: 'Master', plural: 'Masters' },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'specialty', 'order'],
  },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'initials', type: 'text', required: true, admin: { description: 'e.g. "АЛ".' } },
    { name: 'specialty', type: 'text', localized: true },
    {
      name: 'bookingLabel',
      type: 'text',
      localized: true,
      admin: { description: 'Link text, e.g. "Записаться к Алексу ↗".' },
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Ascending. Ties break by creation order.' },
    },
  ],
};
