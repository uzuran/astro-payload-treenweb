import type { CollectionConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Redirect', plural: 'Redirects' },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'permanent'],
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      index: true,
      unique: true,
      admin: { description: 'Path to match, e.g. /old-page' },
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      admin: { description: 'Destination path or absolute URL' },
    },
    {
      name: 'permanent',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'On = 308 permanent. Off = 307 temporary.' },
    },
  ],
};
