import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';
import { roundedField } from '../fields/rounded';

export const Hero: GlobalConfig = {
  slug: 'hero',
  label: 'Hero',
  access: { read: anyone, update: authenticated },
  fields: [
    { name: 'eyebrowLeft', type: 'text', localized: true },
    { name: 'eyebrowRight', type: 'text', localized: true },
    { name: 'headingLine1', type: 'text', localized: true },
    {
      name: 'headingAccent',
      type: 'text',
      localized: true,
      admin: { description: 'Second line, rendered in the accent colour.' },
    },
    { name: 'introText', type: 'textarea', localized: true },
    { name: 'ctaLabel', type: 'text', localized: true },
    { name: 'ctaHref', type: 'text', defaultValue: '#booking' },
    { name: 'sealText', type: 'text', defaultValue: 'F.', localized: true },
    { name: 'sealCaption', type: 'text', localized: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'photoCaptionLeft', type: 'text', localized: true },
    { name: 'photoCaptionRight', type: 'text', localized: true },
    roundedField,
  ],
};
