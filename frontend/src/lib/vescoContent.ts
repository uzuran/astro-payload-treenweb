import { resolveDefaultLocale } from './defaultLocale';
import {
  getVescoCounters,
  getVescoCta,
  getVescoFooter,
  getVescoHero,
  getVescoNavigation,
  type VescoCounters,
  type VescoCta,
  type VescoFooter,
  type VescoHero,
  type VescoNavigation,
} from './payload/client';

export type VescoLocale = 'en' | 'cs';

/**
 * Which Vesco language a prefix-less URL (`/`, `/tarot`, ...) redirects to.
 * Backed by the same SiteSettings → Default locale the [locale]/** skeleton
 * uses; Vesco only ships en/cs, so a stored 'ru' (or anything else the CMS
 * is unreachable/misconfigured into) falls back to 'en'.
 */
export async function resolveVescoDefaultLocale(): Promise<VescoLocale> {
  const locale = await resolveDefaultLocale();
  return locale === 'cs' ? 'cs' : 'en';
}

export interface VescoSections {
  navigation: VescoNavigation | null | undefined;
  hero: VescoHero | null | undefined;
  counters: VescoCounters | null | undefined;
  cta: VescoCta | null | undefined;
  footer: VescoFooter | null | undefined;
}

/**
 * Maps the 5 Vesco content globals to the flat key shape
 * `public/vesco/js/vesco-cs.js`'s `UI.en` / `UI.cs` dictionaries use. Only
 * emits a key when its source field(s) are filled — a partially empty CMS
 * entry must never blank out a working bundled default (cms-merge.js
 * replaces whole keys, it doesn't deep-merge them).
 */
export function toVescoUiOverride(sections: VescoSections): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const set = (key: string, value: string | null | undefined) => {
    if (value) out[key] = value;
  };

  const { navigation, hero, counters, cta, footer } = sections;

  set('est', navigation?.estLabel);
  set('pullCard', navigation?.pullCardLabel);
  const nav: Record<string, string> = {};
  for (const key of ['home', 'tarot', 'horoscope', 'numerology', 'dashboard'] as const) {
    const value = navigation?.nav?.[key];
    if (value) nav[key] = value;
  }
  if (Object.keys(nav).length === 5) out.nav = nav;

  set('heroEyebrow', hero?.eyebrow);
  const heroTitle = [hero?.headingLine1, hero?.headingLine2, hero?.headingAccent];
  if (heroTitle.every((part) => Boolean(part))) out.heroTitle = heroTitle;
  set('heroLede', hero?.lede);
  set('ctaBegin', hero?.ctaBeginLabel);
  set('ctaNumbers', hero?.ctaNumbersLabel);

  set('statCards', counters?.cardsLabel);
  set('statSigns', counters?.signsLabel);
  set('statNumbers', counters?.numbersLabel);

  const ctaTitle = [cta?.headingLine1, cta?.headingLine2];
  if (ctaTitle.every((part) => Boolean(part))) out.ctaTitle = ctaTitle;
  set('ctaBody', cta?.body);
  set('dayStreak', cta?.dayStreakLabel);

  set('variant', footer?.tagline);

  return out;
}

const settle = <T>(promise: Promise<T>, label: string): Promise<T | null> =>
  promise.catch((error: unknown) => {
    // `label` as a separate arg, not interpolated into the format string —
    // keeps console.error's first arg a literal so it's never scanned for
    // (attacker-forgeable) %-format specifiers.
    console.error('[vesco]', label, 'failed:', error);
    return null;
  });

/**
 * Fetches this locale's Vesco content and maps it to a UI-dictionary override.
 * Navigation/Footer are site chrome (every page); Hero/Counters/CTA are
 * home-page-only, so `includeHome` skips those 3 fetches on the other pages.
 */
async function fetchVescoUiOverride(locale: 'en' | 'cs', includeHome: boolean) {
  const [navigation, footer, hero, counters, cta] = await Promise.all([
    settle(getVescoNavigation(locale), `navigation (${locale})`),
    settle(getVescoFooter(locale), `footer (${locale})`),
    includeHome ? settle(getVescoHero(locale), `hero (${locale})`) : Promise.resolve(null),
    includeHome ? settle(getVescoCounters(locale), `counters (${locale})`) : Promise.resolve(null),
    includeHome ? settle(getVescoCta(locale), `cta (${locale})`) : Promise.resolve(null),
  ]);
  return toVescoUiOverride({ navigation, hero, counters, cta, footer });
}

/** `{ en: {...}, cs: {...} }` — pass to <VescoScripts cmsLabels={...}>. */
export async function buildVescoCmsLabels(includeHome = false) {
  const [en, cs] = await Promise.all([
    fetchVescoUiOverride('en', includeHome),
    fetchVescoUiOverride('cs', includeHome),
  ]);
  return { en, cs };
}
