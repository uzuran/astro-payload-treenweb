import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';
import { sectionHeaderFields } from '../fields/sectionHeader';

export const Services: GlobalConfig = {
  slug: 'services',
  label: 'Services',
  access: { read: anyone, update: authenticated },
  fields: [
    ...sectionHeaderFields,
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Service', plural: 'Services' },
      admin: { description: 'Rendered in this order.' },
      // Same list of services in every locale; only the text is translated.
      fields: [
        { name: 'name', type: 'text', required: true, localized: true },
        {
          name: 'badge',
          type: 'text',
          localized: true,
          admin: { description: 'Optional pill, e.g. "КОМБО".' },
        },
        { name: 'description', type: 'text', localized: true },
        {
          name: 'duration',
          type: 'text',
          localized: true,
          admin: { description: 'e.g. "60 мин".' },
        },
        { name: 'priceAmount', type: 'number' },
        { name: 'priceCurrency', type: 'text', defaultValue: 'Kč', localized: true },
        { name: 'anchor', type: 'text', admin: { description: 'Optional #id link target.' } },
      ],
    },
  ],
};
