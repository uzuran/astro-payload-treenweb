import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, type Locale } from '../locale';
import { buildAlternates, otherLocales } from './alternates';

// env.PUBLIC_SITE_URL falls back to http://localhost:4321 in tests (see src/env.ts).
const ORIGIN = 'http://localhost:4321';

describe('buildAlternates', () => {
  it('returns nothing when 0 or 1 locale is offered', () => {
    expect(buildAlternates('/', [])).toEqual([]);
    expect(buildAlternates('/', ['ru'])).toEqual([]);
  });

  it('emits one absolute entry per locale plus x-default -> DEFAULT_LOCALE', () => {
    const alts = buildAlternates('/about', ['ru', 'en', 'cs']);
    expect(alts).toEqual([
      { hreflang: 'ru', href: `${ORIGIN}/ru/about` },
      { hreflang: 'en', href: `${ORIGIN}/en/about` },
      { hreflang: 'cs', href: `${ORIGIN}/cs/about` },
      { hreflang: 'x-default', href: `${ORIGIN}/${DEFAULT_LOCALE}/about` },
    ]);
  });

  it('uses the bare "/<locale>" form for the home path', () => {
    const alts = buildAlternates('/', ['ru', 'en']);
    expect(alts.map((a) => a.href)).toEqual([
      `${ORIGIN}/ru`,
      `${ORIGIN}/en`,
      `${ORIGIN}/${DEFAULT_LOCALE}`,
    ]);
  });

  it('honours the enabled subset and its order', () => {
    const alts = buildAlternates('/posts/x', ['en', 'cs']);
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
