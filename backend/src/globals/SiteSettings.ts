import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';
import { DEFAULT_LOCALE, localeSelectOptions } from '../locales';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: { read: anyone, update: authenticated },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'treenweb' },
    { name: 'tagline', type: 'text', localized: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'ogImage', type: 'upload', relationTo: 'media' },
    {
      type: 'group',
      name: 'seo',
      label: 'SEO defaults',
      fields: [
        {
          name: 'titleTemplate',
          type: 'text',
          localized: true,
          admin: {
            description:
              'Tokens: {page} {site}. e.g. "{page} · {site}". Blank keeps the default "{page} · {site}".',
          },
        },
        {
          name: 'defaultDescription',
          type: 'textarea',
          localized: true,
          admin: {
            description:
              'Meta description for pages that have none of their own. Blank falls back to “Description” above.',
          },
        },
      ],
    },
    {
      name: 'social',
      type: 'array',
      fields: [
        { name: 'platform', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'ticker',
      type: 'array',
      labels: { singular: 'Ticker word', plural: 'Ticker words' },
      fields: [{ name: 'word', type: 'text', required: true, localized: true }],
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'address', type: 'textarea', localized: true },
        { name: 'phone', type: 'text' },
        { name: 'hoursWeekday', type: 'text', localized: true },
        { name: 'hoursSaturday', type: 'text', localized: true },
        { name: 'hoursSunday', type: 'text', localized: true },
        { name: 'mapUrl', type: 'text' },
      ],
    },
    {
      name: 'footerNote',
      type: 'text',
      localized: true,
      admin: { description: 'Small print in the footer bar.' },
    },
    {
      name: 'heroAnimation',
      type: 'select',
      defaultValue: 'fade',
      options: [
        { label: 'Fade', value: 'fade' },
        { label: 'Slide up', value: 'slide-up' },
        { label: 'Zoom', value: 'zoom' },
        { label: 'Neon', value: 'neon' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Entrance animation for the home hero. Same for every locale.',
      },
    },
    // ─── Locale — codes come from src/locales.ts (single source of truth) ───
    {
      name: 'defaultLocale',
      type: 'select',
      required: true,
      defaultValue: DEFAULT_LOCALE,
      options: localeSelectOptions,
      admin: {
        position: 'sidebar',
        description:
          'Landing redirect for "/" and the hreflang x-default target. Must be one of the enabled locales below. The fallback language for untranslated fields is fixed in code (ru) and is not affected by this.',
      },
    },
    {
      name: 'supportedLocales',
      type: 'array',
      admin: {
        description:
          'Locales offered in the switcher / hreflang. Codes must match localization.locales in payload.config.ts.',
      },
      fields: [
        { name: 'code', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'enabled', type: 'checkbox', defaultValue: true },
      ],
    },
  ],
};
