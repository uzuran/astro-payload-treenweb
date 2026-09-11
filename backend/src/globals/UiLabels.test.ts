import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { UiLabels } from './UiLabels';

type Group = Extract<Field, { type: 'group' }>;

const groups = (UiLabels.fields as Field[]).filter((f): f is Group => f.type === 'group');

const schema: Record<string, { name: string; type: string; localized: boolean }[]> = {};
for (const g of groups) {
  schema[(g as { name: string }).name] = (g.fields as Field[]).map((f) => ({
    name: (f as { name: string }).name,
    type: f.type,
    localized: Boolean((f as { localized?: boolean }).localized),
  }));
}
const groupNames = Object.keys(schema);

describe('UiLabels global — structure', () => {
  it('is the `ui-labels` global with the chrome groups', () => {
    expect(UiLabels.slug).toBe('ui-labels');
    expect(groupNames.sort()).toEqual(['booking', 'consent', 'footer', 'header', 'notFound']);
  });

  it('every leaf is a localized text/textarea field', () => {
    for (const [group, fields] of Object.entries(schema)) {
      for (const f of fields) {
        expect(['text', 'textarea'], `${group}.${f.name} type`).toContain(f.type);
        expect(f.localized, `${group}.${f.name} localized`).toBe(true);
      }
    }
  });

  it('exposes exactly the expected leaf names', () => {
    const names = Object.fromEntries(
      Object.entries(schema).map(([g, fs]) => [g, fs.map((f) => f.name).sort()]),
    );
    expect(names).toEqual({
      header: ['cta'],
      footer: ['disclaimer', 'findUsHeading', 'hoursHeading'],
      consent: ['analyticsButton', 'body', 'essentialButton'],
      booking: [
        'anyMasterOption',
        'dateLabel',
        'masterLabel',
        'nameLabel',
        'namePlaceholder',
        'phoneLabel',
        'phonePlaceholder',
        'resultTemplate',
        'serviceLabel',
        'submitLabel',
      ],
      notFound: [
        'backHomeLabel',
        'body',
        'heading',
        'heading404',
        'missingPathTemplate',
        'pageMetaTitle',
        'postHeading',
        'postMetaTitle',
      ],
    });
  });
});
