import { describe, expect, it } from 'vitest';

import {
  assertLocale,
  DEFAULT_LOCALE,
  dirFor,
  isLocale,
  LOCALES,
  localizedPath,
  pickDefaultLocale,
  stripLocale,
} from './locale';

describe('locale constants', () => {
  it('DEFAULT_LOCALE is one of LOCALES', () => {
    expect(LOCALES).toContain(DEFAULT_LOCALE);
  });
});

describe('isLocale', () => {
  it('accepts every routable code', () => {
    for (const code of LOCALES) expect(isLocale(code)).toBe(true);
  });

  it('rejects unknown / non-string values', () => {
    for (const v of ['de', 'RU', 'en-US', '', ' ru', undefined, null, 5, {}]) {
      expect(isLocale(v)).toBe(false);
    }
  });
});

describe('assertLocale', () => {
  it('passes a valid locale through', () => {
    expect(assertLocale('en')).toBe('en');
  });

  it('falls back to DEFAULT_LOCALE for anything invalid', () => {
    expect(assertLocale('de')).toBe(DEFAULT_LOCALE);
    expect(assertLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(assertLocale(123)).toBe(DEFAULT_LOCALE);
  });
});

describe('dirFor', () => {
  it('is ltr for every shipped locale', () => {
    for (const code of LOCALES) expect(dirFor(code)).toBe('ltr');
  });

  it('is rtl for known RTL bases, region subtag included', () => {
    expect(dirFor('ar')).toBe('rtl');
    expect(dirFor('he-IL')).toBe('rtl');
    expect(dirFor('FA')).toBe('rtl');
  });

  it('defaults unknown tags to ltr', () => {
    expect(dirFor('zz')).toBe('ltr');
    expect(dirFor('')).toBe('ltr');
  });
});

describe('stripLocale', () => {
  it('drops a leading locale segment', () => {
    expect(stripLocale('/en/about')).toBe('/about');
    expect(stripLocale('/ru/posts/hello')).toBe('/posts/hello');
  });

  it('maps a bare locale root to "/"', () => {
    expect(stripLocale('/en')).toBe('/');
    expect(stripLocale('/ru')).toBe('/');
  });

  it('leaves a locale-less path untouched', () => {
    expect(stripLocale('/about')).toBe('/about');
    expect(stripLocale('/')).toBe('/');
  });

  it('does not treat a non-locale first segment as a prefix', () => {
    expect(stripLocale('/enterprise')).toBe('/enterprise');
    expect(stripLocale('/de/about')).toBe('/de/about');
  });
});

describe('localizedPath', () => {
  it('prefixes a locale-less path', () => {
    expect(localizedPath('en', '/about')).toBe('/en/about');
    expect(localizedPath('cs', '/posts/hello')).toBe('/cs/posts/hello');
  });

  it('renders the home path as a bare "/<locale>" (no trailing slash)', () => {
    expect(localizedPath('ru', '/')).toBe('/ru');
    expect(localizedPath('en', '/en')).toBe('/en');
  });

  it('swaps an existing locale prefix rather than stacking', () => {
    expect(localizedPath('cs', '/en/about')).toBe('/cs/about');
    expect(localizedPath('en', '/ru')).toBe('/en');
  });

  it('round-trips with stripLocale', () => {
    for (const path of ['/about', '/posts/x', '/']) {
      expect(stripLocale(localizedPath('en', path))).toBe(path);
    }
  });
});

describe('pickDefaultLocale', () => {
  it('returns the wanted locale when it is enabled', () => {
    expect(pickDefaultLocale('en', ['ru', 'en', 'cs'])).toBe('en');
  });

  it('degrades an unroutable code to DEFAULT_LOCALE when that is enabled', () => {
    expect(pickDefaultLocale('de', ['ru', 'en', 'cs'])).toBe(DEFAULT_LOCALE);
  });

  it('falls back to the first enabled locale when the wanted one is not offered', () => {
    expect(pickDefaultLocale('en', ['ru', 'cs'])).toBe('ru');
    expect(pickDefaultLocale('cs', ['en', 'ru'])).toBe('en');
  });

  it('applies no constraint when the enabled set is empty', () => {
    expect(pickDefaultLocale('en', [])).toBe('en');
    expect(pickDefaultLocale('de', [])).toBe(DEFAULT_LOCALE);
  });
});
