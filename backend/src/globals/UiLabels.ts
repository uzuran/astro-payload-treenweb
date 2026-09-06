import type { Field, GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

const text = (name: string, description?: string): Field => ({
  name,
  type: 'text',
  localized: true,
  ...(description ? { admin: { description } } : {}),
});

const area = (name: string, description?: string): Field => ({
  name,
  type: 'textarea',
  localized: true,
  ...(description ? { admin: { description } } : {}),
});

/**
 * Localised UI chrome — the interface strings the frontend used to hard-code in
 * `frontend/src/lib/i18n/ui.ts`. Every field is `localized`. Leave a field blank
 * to fall back to that bundled dictionary for the locale (the frontend reads
 * this global first, dictionary second).
 *
 * NOT here: aria-only strings (screen-reader labels for nav / hamburger /
 * switcher / logo). Those stay in code — `frontend/src/lib/i18n/aria.ts`.
 */
export const UiLabels: GlobalConfig = {
  slug: 'ui-labels',
  label: 'Interface Text',
  access: { read: anyone, update: authenticated },
  admin: {
    description:
      'Site-wide interface wording. A blank field falls back to the built-in translation for that locale.',
  },
  fields: [
    {
      type: 'group',
      name: 'header',
      fields: [text('cta', 'Header “Book” button.')],
    },
    {
      type: 'group',
      name: 'footer',
      fields: [text('findUsHeading'), text('hoursHeading'), text('disclaimer')],
    },
    {
      type: 'group',
      name: 'booking',
      fields: [
        text('nameLabel'),
        text('namePlaceholder'),
        text('phoneLabel'),
        text('phonePlaceholder'),
        text('serviceLabel'),
        text('masterLabel'),
        text('anyMasterOption'),
        text('dateLabel'),
        text('submitLabel'),
        area('resultTemplate', 'Confirmation line. Tokens: {name} {service} {date}.'),
      ],
    },
    {
      type: 'group',
      name: 'notFound',
      fields: [
        text('pageMetaTitle', '<title> for a missing content page.'),
        text('postMetaTitle', '<title> for a missing post.'),
        text('heading', 'On-page heading for a missing content page.'),
        text('heading404', 'Heading for the standalone /404 route.'),
        area('body', 'Body text on the standalone /404 route.'),
        text('missingPathTemplate', 'Missing-page line. Token: {path} (rendered in <code>).'),
        text('postHeading', 'On-page heading for a missing post.'),
        text('backHomeLabel', '“Back to home” link text.'),
      ],
    },
  ],
};
