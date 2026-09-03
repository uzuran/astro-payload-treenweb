import type { Field } from 'payload';

import { formatSlug } from '../lib/formatSlug';

/** Reusable URL-slug field. Auto-derives from `sourceField` when left blank. */
export const slugField = (sourceField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  required: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'URL path segment. Generated from the title if left blank.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.length > 0) return formatSlug(value);
        const source = data?.[sourceField];
        return typeof source === 'string' ? formatSlug(source) : value;
      },
    ],
  },
});
