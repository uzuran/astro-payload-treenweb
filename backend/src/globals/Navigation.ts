import type { ArrayField, GlobalConfig } from 'payload';

const menu = (name: string, label: string, description: string): ArrayField => ({
  name,
  label,
  type: 'array',
  admin: { description },
  fields: [
    // Same link structure in every locale; only the visible text is translated.
    { name: 'label', type: 'text', required: true, localized: true },
    {
      name: 'href',
      type: 'text',
      required: true,
      admin: { description: 'Path (/about) or on-page anchor (#booking). Shared across locales.' },
    },
  ],
});

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    menu('main', 'Main menu', 'Header navigation.'),
    menu('footer', 'Footer menu', 'Secondary link row in the site footer. Leave empty to hide it.'),
  ],
};
