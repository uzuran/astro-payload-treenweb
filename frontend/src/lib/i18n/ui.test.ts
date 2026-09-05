import { describe, expect, it, vi } from 'vitest';

import { LOCALES } from '../locale';
import { t, UI } from './ui';

describe('ui dictionary', () => {
  const ruKeys = Object.keys(UI.ru).sort();

  it('every locale has exactly the ru key set', () => {
    for (const locale of LOCALES) {
      expect(Object.keys(UI[locale]).sort()).toEqual(ruKeys);
    }
  });

  it('no locale has an empty string', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(UI[locale])) {
        expect(value, `${locale}.${key}`).not.toBe('');
      }
    }
  });

  it('interpolates {params}', () => {
    expect(t('en')('header.homeAria', { site: 'FORMA' })).toBe('FORMA, home');
    expect(
      t('cs')('booking.result', { name: 'Jan', service: 'Střih', date: '01.02.2026' }),
    ).toContain('Jan, hotovo: Střih, 01.02.2026');
  });

  it('falls back to ru and warns for an unknown key', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    // @ts-expect-error — deliberately passing a bad key
    expect(t('en')('nope.nope')).toBe('nope.nope');
    warn.mockRestore();
  });
});
