import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';
import { sectionHeaderFields } from '../fields/sectionHeader';

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About',
  access: { read: anyone, update: authenticated },
  fields: [
    ...sectionHeaderFields,
    { name: 'leadParagraph', type: 'textarea' },
    { name: 'bodyParagraph', type: 'textarea' },
    { name: 'footnote', type: 'text' },
  ],
};
