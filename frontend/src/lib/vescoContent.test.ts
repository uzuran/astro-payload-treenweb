import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveVescoDefaultLocale, toVescoUiOverride, type VescoSections } from './vescoContent';

const empty: VescoSections = {
  navigation: null,
  hero: null,
  counters: null,
  cta: null,
  footer: null,
};

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });

describe('toVescoUiOverride', () => {
  it('returns an empty object when every section is empty', () => {
    expect(toVescoUiOverride(empty)).toEqual({});
  });

  it('maps a fully-populated set of sections to the flat UI key shape', () => {
    const out = toVescoUiOverride({
      navigation: {
        estLabel: 'est. mmxxvi',
        pullCardLabel: 'Pull a card',
        nav: {
          home: 'Home',
          tarot: 'Tarot',
          horoscope: 'Horoscope',
          numerology: 'Numerology',
          dashboard: 'Dashboard',
        },
      },
      hero: {
        eyebrow: 'your daily reading is ready',
        headingLine1: 'A quieter way',
        headingLine2: 'to read the',
        headingAccent: 'day ahead',
        lede: 'Vesco pairs a tarot deck with your numbers.',
        ctaBeginLabel: "Begin today's reading",
        ctaNumbersLabel: 'Find your numbers',
      },
      counters: {
        cardsLabel: 'Painted cards',
        signsLabel: 'Sign forecasts',
        numbersLabel: 'Core numbers',
      },
      cta: {
        headingLine1: 'Read the same way',
        headingLine2: 'every morning',
        body: 'Built for a ninety-second habit.',
        dayStreakLabel: 'day streak',
      },
      footer: { tagline: 'Variant I · Mystic Minimalism' },
    });

    expect(out).toEqual({
      est: 'est. mmxxvi',
      pullCard: 'Pull a card',
      nav: {
        home: 'Home',
        tarot: 'Tarot',
        horoscope: 'Horoscope',
        numerology: 'Numerology',
        dashboard: 'Dashboard',
      },
      heroEyebrow: 'your daily reading is ready',
      heroTitle: ['A quieter way', 'to read the', 'day ahead'],
      heroLede: 'Vesco pairs a tarot deck with your numbers.',
      ctaBegin: "Begin today's reading",
      ctaNumbers: 'Find your numbers',
      statCards: 'Painted cards',
      statSigns: 'Sign forecasts',
      statNumbers: 'Core numbers',
      ctaTitle: ['Read the same way', 'every morning'],
      ctaBody: 'Built for a ninety-second habit.',
      dayStreak: 'day streak',
      variant: 'Variant I · Mystic Minimalism',
    });
  });

  it('omits a key when its source field is blank', () => {
    expect(toVescoUiOverride({ ...empty, footer: { tagline: '' } })).toEqual({});
  });

  it('never emits a partial heroTitle/ctaTitle array (would blank working lines)', () => {
    const out = toVescoUiOverride({
      ...empty,
      hero: { headingLine1: 'Only line one' },
      cta: { headingLine1: 'Only line one' },
    });
    expect(out.heroTitle).toBeUndefined();
    expect(out.ctaTitle).toBeUndefined();
  });

  it('never emits a partial nav object (would blank the other menu items)', () => {
    const out = toVescoUiOverride({ ...empty, navigation: { nav: { home: 'Home' } } });
    expect(out.nav).toBeUndefined();
  });
});

describe('resolveVescoDefaultLocale', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses the locale set in SiteSettings', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ defaultLocale: 'cs' })),
    );
    expect(await resolveVescoDefaultLocale()).toBe('cs');
  });

  it('falls back to en when SiteSettings is set to a locale Vesco has no route for', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ defaultLocale: 'ru' })),
    );
    expect(await resolveVescoDefaultLocale()).toBe('en');
  });

  it('falls back to en when the CMS is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNREFUSED');
      }),
    );
    expect(await resolveVescoDefaultLocale()).toBe('en');
  });
});
