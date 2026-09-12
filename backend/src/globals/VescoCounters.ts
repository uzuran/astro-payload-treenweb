import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

/**
 * Captions for the hero's stat row (78 / 12 / 6). The numbers themselves are
 * facts about the tarot/zodiac/numerology engine (78 cards, 12 signs, 6 core
 * numbers) — not content, so not editable here; only their captions are.
 */
export const VescoCounters: GlobalConfig = {
  slug: 'vesco-counters',
  label: 'Vesco — Counters',
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'cardsLabel',
      type: 'text',
      localized: true,
      admin: { description: 'Caption under "78".' },
    },
    {
      name: 'signsLabel',
      type: 'text',
      localized: true,
      admin: { description: 'Caption under "12".' },
    },
    {
      name: 'numbersLabel',
      type: 'text',
      localized: true,
      admin: { description: 'Caption under "6".' },
    },
  ],
};
