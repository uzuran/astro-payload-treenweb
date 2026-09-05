import type { GlobalConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';
import { roundedField } from '../fields/rounded';
import { sectionHeaderFields } from '../fields/sectionHeader';

/** Section-header copy for the team block. The people live in the `masters` collection. */
export const Team: GlobalConfig = {
  slug: 'team',
  label: 'Team',
  access: { read: anyone, update: authenticated },
  fields: [...sectionHeaderFields, roundedField],
};
