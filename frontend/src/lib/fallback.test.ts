import { describe, expect, it } from 'vitest';

import { getFallback } from './fallback';
import { LOCALES } from './locale';

describe('getFallback', () => {
  it('returns per-locale content for every routable locale', () => {
    expect(getFallback('ru').hero.headingLine1).toBe('ТВОЯ ФОРМА.');
    expect(getFallback('en').hero.headingLine1).toBe('YOUR SHAPE.');
    expect(getFallback('cs').hero.headingLine1).toBe('TVŮJ TVAR.');

    expect(getFallback('en').site.siteName).toBe('FORMA');
    expect(getFallback('cs').booking.disclaimer).toContain('Ukázkový');
  });

  it('every locale bundle has the same shape', () => {
    const keys = (o: object) => Object.keys(o).sort();
    const ru = getFallback('ru');
    for (const l of LOCALES) {
      const b = getFallback(l);
      expect(keys(b), l).toEqual(keys(ru));
      expect(keys(b.site), `${l}.site`).toEqual(keys(ru.site));
      expect(keys(b.hero), `${l}.hero`).toEqual(keys(ru.hero));
      expect(keys(b.about), `${l}.about`).toEqual(keys(ru.about));
      expect(keys(b.booking), `${l}.booking`).toEqual(keys(ru.booking));
      expect(b.services.items?.length, `${l}.services.items`).toBe(ru.services.items?.length);
      expect(b.masters.length, `${l}.masters`).toBe(ru.masters.length);
      expect(b.nav.length, `${l}.nav`).toBe(ru.nav.length);
      expect(b.ticker.length, `${l}.ticker`).toBe(ru.ticker.length);
    }
  });

  it('keeps the nav hrefs shared across locales (only labels translate)', () => {
    const hrefs = (l: (typeof LOCALES)[number]) => getFallback(l).nav.map((n) => n.href);
    expect(hrefs('en')).toEqual(hrefs('ru'));
    expect(hrefs('cs')).toEqual(hrefs('ru'));
    expect(getFallback('en').nav[0]?.label).not.toBe(getFallback('ru').nav[0]?.label);
  });

  it('falls back to DEFAULT_LOCALE content for an unknown locale', () => {
    // @ts-expect-error — deliberate bad locale
    expect(getFallback('de')).toBe(getFallback('ru'));
  });
});
