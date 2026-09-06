import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

/** Tunables for the CSS hero entrance animation (Hero.astro + global.css).
 *  Shared across locales — it's timing, not copy. */
export const AnimationSettings: GlobalConfig = {
  slug: 'animation-settings',
  label: 'Animation Settings',
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'duration',
      type: 'number',
      defaultValue: 1.2,
      min: 0.2,
      max: 5,
      admin: {
        description:
          'Hero entrance length in seconds for Fade / Slide up / Zoom. Neon keeps its own timing. 0.2–5s, default 1.2.',
      },
    },
  ],
};
