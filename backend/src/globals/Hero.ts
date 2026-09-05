import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

export const Hero: GlobalConfig = {
  slug: 'hero',
  label: 'Hero',
  access: { read: anyone, update: authenticated },
  fields: [
    { name: 'eyebrowLeft', type: 'text' },
    { name: 'eyebrowRight', type: 'text' },
    { name: 'headingLine1', type: 'text' },
    {
      name: 'headingAccent',
      type: 'text',
      admin: { description: 'Second line, rendered in the accent colour.' },
    },
    { name: 'introText', type: 'textarea' },
    { name: 'ctaLabel', type: 'text' },
    { name: 'ctaHref', type: 'text', defaultValue: '#booking' },
    { name: 'sealText', type: 'text', defaultValue: 'F.' },
    { name: 'sealCaption', type: 'text' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'photoCaptionLeft', type: 'text' },
    { name: 'photoCaptionRight', type: 'text' },
  ],
};
