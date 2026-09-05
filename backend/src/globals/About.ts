import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';
import { roundedField } from '../fields/rounded';
import { sectionHeaderFields } from '../fields/sectionHeader';

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About',
  access: { read: anyone, update: authenticated },
  fields: [
    ...sectionHeaderFields,
    { name: 'leadParagraph', type: 'textarea', localized: true },
    { name: 'bodyParagraph', type: 'textarea', localized: true },
    { name: 'footnote', type: 'text', localized: true },
    roundedField,
  ],
};
