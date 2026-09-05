import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';
import { sectionHeaderFields } from '../fields/sectionHeader';

export const Booking: GlobalConfig = {
  slug: 'booking',
  label: 'Booking',
  access: { read: anyone, update: authenticated },
  fields: [
    ...sectionHeaderFields,
    { name: 'intro', type: 'textarea', localized: true },
    {
      name: 'disclaimer',
      type: 'textarea',
      localized: true,
      admin: { description: 'Notice shown under the demo form.' },
    },
  ],
};
