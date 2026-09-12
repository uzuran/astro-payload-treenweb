import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

/** Closing CTA section at the bottom of the Vesco homepage. */
export const VescoCta: GlobalConfig = {
  slug: 'vesco-cta',
  label: 'Vesco — CTA',
  access: { read: anyone, update: authenticated },
  fields: [
    { name: 'headingLine1', type: 'text', localized: true },
    { name: 'headingLine2', type: 'text', localized: true },
    { name: 'body', type: 'textarea', localized: true },
    {
      name: 'dayStreakLabel',
      type: 'text',
      localized: true,
      admin: { description: '"day streak" caption.' },
    },
  ],
};
