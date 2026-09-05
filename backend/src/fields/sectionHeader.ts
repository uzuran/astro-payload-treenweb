import type { Field } from 'payload';

/**
 * Shared "section top" copy used by Services / About / Team / Booking: the
 * small "01 / LABEL" eyebrow, a headline (line breaks are honoured on the
 * frontend), an optional trailing fragment rendered in the accent colour,
 * and an optional muted note shown beside the headline.
 */
export const sectionHeaderFields: Field[] = [
  { name: 'eyebrow', type: 'text', localized: true, admin: { description: 'e.g. "01 / УСЛУГИ".' } },
  {
    name: 'heading',
    type: 'textarea',
    localized: true,
    admin: { description: 'Headline. Line breaks are preserved on the site.' },
  },
  {
    name: 'headingAccent',
    type: 'text',
    localized: true,
    admin: { description: 'Optional trailing fragment rendered in the accent colour.' },
  },
  {
    name: 'note',
    type: 'text',
    localized: true,
    admin: { description: 'Optional muted text beside the headline.' },
  },
];
