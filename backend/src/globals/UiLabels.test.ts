import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { UI_LABEL_LOCALES, uiLabelsSeed } from '../seed/uiLabels';
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
  it('is the `ui-labels` global with the four chrome groups', () => {
    expect(UiLabels.slug).toBe('ui-labels');
    expect(groupNames.sort()).toEqual(['booking', 'footer', 'header', 'notFound']);
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

describe('uiLabelsSeed — coverage', () => {
  const asRecord = (locale: (typeof UI_LABEL_LOCALES)[number]) =>
    uiLabelsSeed[locale] as unknown as Record<string, Record<string, string> | undefined>;

  it('fills every schema leaf for ru/en/cs with a non-empty string', () => {
    for (const locale of UI_LABEL_LOCALES) {
      const bundle = asRecord(locale);
      for (const group of groupNames) {
        for (const { name } of schema[group] ?? []) {
          const v = bundle[group]?.[name];
          expect(typeof v === 'string' && v.trim().length > 0, `${locale}.${group}.${name}`).toBe(
            true,
          );
        }
      }
    }
  });

  it('carries no keys beyond the schema', () => {
    for (const locale of UI_LABEL_LOCALES) {
      const bundle = asRecord(locale);
      expect(Object.keys(bundle).sort()).toEqual([...groupNames].sort());
      for (const group of groupNames) {
        expect(Object.keys(bundle[group] ?? {}).sort()).toEqual(
          (schema[group] ?? []).map((f) => f.name).sort(),
        );
      }
    }
  });

  it('keeps {name}/{service}/{date} in every resultTemplate', () => {
    for (const locale of UI_LABEL_LOCALES) {
      const tpl = uiLabelsSeed[locale].booking.resultTemplate;
      for (const tok of ['{name}', '{service}', '{date}']) {
        expect(tpl, `${locale} resultTemplate ${tok}`).toContain(tok);
      }
    }
  });

  it('keeps {path} in every missingPathTemplate', () => {
    for (const locale of UI_LABEL_LOCALES) {
      expect(uiLabelsSeed[locale].notFound.missingPathTemplate, locale).toContain('{path}');
    }
  });
});
