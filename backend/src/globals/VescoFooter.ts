import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

/** Vesco footer. The "VESCO" wordmark is the brand name — same in every
 * locale, not a content field. Only the tagline is localized copy. */
export const VescoFooter: GlobalConfig = {
  slug: 'vesco-footer',
  label: 'Vesco — Footer',
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      admin: { description: '"Variant I · Mystic Minimalism".' },
    },
  ],
};
