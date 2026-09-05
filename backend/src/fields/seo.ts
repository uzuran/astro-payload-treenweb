import type { Field } from 'payload';

/** Shared SEO metadata group, added to every routable collection. */
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      admin: { description: 'Overrides <title> / OG title. Falls back to the document title.' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: { description: 'Meta description / OG description (~155 chars).' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'OG / social share image. Shared across locales.' },
    },
    {
      name: 'noindex',
      type: 'checkbox',
      defaultValue: false,
      label: 'Discourage search engines from indexing this page',
    },
  ],
};
