import { describe, expect, it } from 'vitest';

import { LOCALES } from '../locale';
import { type LegalContent, legal } from './legal';

const STRING_KEYS: (keyof LegalContent)[] = [
  'metaTitle',
  'title',
  'intro',
  'cookiesHeading',
  'analyticsHeading',
  'analyticsBody',
  'manageHeading',
  'manageBody',
  'manageButton',
  'footerLink',
];

describe('legal', () => {
  it('resolves every locale to a full, non-empty notice', () => {
    for (const locale of LOCALES) {
      const c = legal(locale);
      for (const key of STRING_KEYS) {
        expect(String(c[key]).trim(), `${locale}.${key}`).not.toBe('');
      }
      expect(c.cookies.length, `${locale}.cookies`).toBeGreaterThanOrEqual(2);
      for (const row of c.cookies) {
        expect(row.name.trim()).not.toBe('');
        expect(row.purpose.trim()).not.toBe('');
        expect(row.retention.trim()).not.toBe('');
      }
    }
  });

  it('documents the two cookies the site actually sets', () => {
    for (const locale of LOCALES) {
      const names = legal(locale).cookies.map((row) => row.name);
      expect(names).toContain('locale');
      expect(names).toContain('cookie_consent');
    }
  });

  it('falls back to the default locale for an unknown one', () => {
    // @ts-expect-error — deliberate bad locale
    expect(legal('de')).toBe(legal('ru'));
  });
});
