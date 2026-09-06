import { describe, expect, it } from 'vitest';

import { LOCALES } from '../locale';
import { ARIA_KEYS, aria } from './aria';

describe('aria', () => {
  it('resolves every key for every locale to a non-empty string', () => {
    for (const locale of LOCALES) {
      const a = aria(locale);
      for (const key of ARIA_KEYS) expect(a(key), `${locale}.${key}`).toBeTruthy();
    }
  });

  it('interpolates {site} in homeAria', () => {
    expect(aria('en')('homeAria', { site: 'FORMA' })).toBe('FORMA, home');
    expect(aria('cs')('homeAria', { site: 'FORMA' })).toBe('FORMA, domů');
    expect(aria('ru')('homeAria', { site: 'FORMA' })).toBe('FORMA, главная');
  });

  it('falls back to DEFAULT_LOCALE for an unknown locale', () => {
    // @ts-expect-error — deliberate bad locale
    expect(aria('de')('navAria')).toBe(aria('ru')('navAria'));
  });
});
