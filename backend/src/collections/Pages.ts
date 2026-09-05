import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated';
import { seoField } from '../fields/seo';
import { slugField } from '../fields/slug';

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
  },
  versions: {
    drafts: { autosave: false },
    maxPerDoc: 25,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    // slug stays shared across locales (Option A): /en/about, /about — same segment.
    slugField('title'),
    { name: 'content', type: 'richText', localized: true },
    seoField,
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
  ],
};
