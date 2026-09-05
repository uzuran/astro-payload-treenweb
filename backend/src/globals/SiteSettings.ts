import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

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
    // ─── Locale (design-only for now; Payload localization is NOT enabled) ───
    {
      name: 'defaultLocale',
      type: 'select',
      required: true,
      defaultValue: 'ru',
      options: [
        { label: 'Русский', value: 'ru' },
        { label: 'English', value: 'en' },
        { label: 'Čeština', value: 'cs' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Drives <html lang>. Multilingual content is not enabled yet.',
      },
    },
    {
      name: 'supportedLocales',
      type: 'array',
      admin: {
        description:
          'Future locale set (switcher, hreflang). Codes must match Payload localization when it is enabled.',
      },
      fields: [
        { name: 'code', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'enabled', type: 'checkbox', defaultValue: true },
      ],
    },
  ],
};
