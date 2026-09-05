import type { ArrayField, GlobalConfig } from 'payload';

const menu = (name: string, label: string): ArrayField => ({
  name,
  label,
  type: 'array',
  fields: [
    // Same link structure in every locale; only the visible text is translated.
    { name: 'label', type: 'text', required: true, localized: true },
    { name: 'href', type: 'text', required: true },
  ],
});

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [menu('main', 'Main menu'), menu('footer', 'Footer menu')],
};
