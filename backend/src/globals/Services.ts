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
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'badge', type: 'text', admin: { description: 'Optional pill, e.g. "КОМБО".' } },
        { name: 'description', type: 'text' },
        { name: 'duration', type: 'text', admin: { description: 'e.g. "60 мин".' } },
        { name: 'priceAmount', type: 'number' },
        { name: 'priceCurrency', type: 'text', defaultValue: 'Kč' },
        { name: 'anchor', type: 'text', admin: { description: 'Optional #id link target.' } },
      ],
    },
  ],
};
