import { describe, expect, it } from 'vitest';

import { type Locale } from '../locale';
import { buildAlternates, otherLocales } from './alternates';

// env.PUBLIC_SITE_URL falls back to http://localhost:4321 in tests (see src/env.ts).
const ORIGIN = 'http://localhost:4321';

describe('buildAlternates', () => {
  it('returns nothing when 0 or 1 locale is offered', () => {
    expect(buildAlternates('/', [], 'ru')).toEqual([]);
    expect(buildAlternates('/', ['ru'], 'ru')).toEqual([]);
  });

  it('emits one absolute entry per locale plus x-default → the given default', () => {
    const alts = buildAlternates('/about', ['ru', 'en', 'cs'], 'ru');
    expect(alts).toEqual([
      { hreflang: 'ru', href: `${ORIGIN}/ru/about` },
      { hreflang: 'en', href: `${ORIGIN}/en/about` },
      { hreflang: 'cs', href: `${ORIGIN}/cs/about` },
      { hreflang: 'x-default', href: `${ORIGIN}/ru/about` },
    ]);
  });

  it('points x-default at the admin-selected default locale', () => {
    const alts = buildAlternates('/about', ['ru', 'en', 'cs'], 'en');
    expect(alts.at(-1)).toEqual({ hreflang: 'x-default', href: `${ORIGIN}/en/about` });
  });

  it('falls x-default back to the first enabled locale when the default is not enabled', () => {
    const alts = buildAlternates('/about', ['en', 'cs'], 'ru');
    expect(alts.at(-1)).toEqual({ hreflang: 'x-default', href: `${ORIGIN}/en/about` });
  });

  it('uses the bare "/<locale>" form for the home path', () => {
    const alts = buildAlternates('/', ['ru', 'en'], 'ru');
    expect(alts.map((a) => a.href)).toEqual([`${ORIGIN}/ru`, `${ORIGIN}/en`, `${ORIGIN}/ru`]);
  });

  it('honours the enabled subset and its order', () => {
    const alts = buildAlternates('/posts/x', ['en', 'cs'], 'en');
    expect(alts.map((a) => a.hreflang)).toEqual(['en', 'cs', 'x-default']);
  });
});

describe('otherLocales', () => {
  it('drops the current locale, keeps the rest in order', () => {
    expect(otherLocales('ru', ['ru', 'en', 'cs'])).toEqual(['en', 'cs']);
    expect(otherLocales('en', ['ru', 'en', 'cs'])).toEqual(['ru', 'cs']);
  });

  it('is empty when the current locale is the only one enabled', () => {
    expect(otherLocales('ru', ['ru'])).toEqual([]);
  });

  it('ignores a current locale that is not in the enabled set', () => {
    const enabled: Locale[] = ['en', 'cs'];
    expect(otherLocales('ru', enabled)).toEqual(['en', 'cs']);
  });
});
