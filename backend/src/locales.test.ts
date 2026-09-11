import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  LOCALES,
  localeSelectOptions,
  supportedLocalesSeed,
} from './locales';

describe('locales', () => {
  it('has a label for every locale, and no extras', () => {
    expect(Object.keys(LOCALE_LABELS).sort()).toEqual([...LOCALES].sort());
  });

  it('DEFAULT_LOCALE is one of the enabled locales', () => {
    expect(LOCALES).toContain(DEFAULT_LOCALE);
  });

  it('localeSelectOptions mirrors LOCALES 1:1, in order', () => {
    expect(localeSelectOptions.map((o) => o.value)).toEqual([...LOCALES]);
    for (const option of localeSelectOptions) {
      expect(option.label).toBe(LOCALE_LABELS[option.value as (typeof LOCALES)[number]]);
    }
  });

  it('supportedLocalesSeed covers every locale, all enabled', () => {
    expect(supportedLocalesSeed.map((s) => s.code)).toEqual([...LOCALES]);
    expect(supportedLocalesSeed.every((s) => s.enabled)).toBe(true);
  });
});
