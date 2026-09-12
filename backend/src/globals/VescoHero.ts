import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

/** Vesco homepage hero: eyebrow, 3-line heading, lede (the intro/description), CTAs. */
export const VescoHero: GlobalConfig = {
  slug: 'vesco-hero',
  label: 'Vesco — Hero',
  access: { read: anyone, update: authenticated },
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'headingLine1', type: 'text', localized: true },
    { name: 'headingLine2', type: 'text', localized: true },
    { name: 'headingAccent', type: 'text', localized: true },
    {
      name: 'lede',
      type: 'textarea',
      localized: true,
      admin: { description: 'The intro / description paragraph under the heading.' },
    },
    { name: 'ctaBeginLabel', type: 'text', localized: true },
    { name: 'ctaNumbersLabel', type: 'text', localized: true },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
};
