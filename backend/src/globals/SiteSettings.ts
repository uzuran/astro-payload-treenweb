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
    { name: 'tagline', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'ogImage', type: 'upload', relationTo: 'media' },
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
      fields: [{ name: 'word', type: 'text', required: true }],
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'address', type: 'textarea' },
        { name: 'phone', type: 'text' },
        { name: 'hoursWeekday', type: 'text' },
        { name: 'hoursSaturday', type: 'text' },
        { name: 'hoursSunday', type: 'text' },
        { name: 'mapUrl', type: 'text' },
      ],
    },
    { name: 'footerNote', type: 'text', admin: { description: 'Small print in the footer bar.' } },
    // ─── Locale — codes come from src/locales.ts (single source of truth) ───
    {
      name: 'defaultLocale',
      type: 'select',
      required: true,
      defaultValue: DEFAULT_LOCALE,
      options: localeSelectOptions,
      admin: {
        position: 'sidebar',
        description: 'Locale assumed when a request carries no /xx prefix. Drives <html lang>.',
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
