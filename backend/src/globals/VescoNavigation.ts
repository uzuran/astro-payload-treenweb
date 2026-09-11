import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

/** Vesco header: nav labels, the "Pull a card" CTA, and the "est. mmxxvi" tagline. */
export const VescoNavigation: GlobalConfig = {
  slug: 'vesco-navigation',
  label: 'Vesco — Navigation',
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'estLabel',
      type: 'text',
      localized: true,
      admin: { description: '"est. mmxxvi" tagline next to the logo.' },
    },
    { name: 'pullCardLabel', type: 'text', localized: true },
    {
      type: 'group',
      name: 'nav',
      label: 'Menu items',
      fields: [
        { name: 'home', type: 'text', localized: true },
        { name: 'tarot', type: 'text', localized: true },
        { name: 'horoscope', type: 'text', localized: true },
        { name: 'numerology', type: 'text', localized: true },
        { name: 'dashboard', type: 'text', localized: true },
      ],
    },
  ],
};
