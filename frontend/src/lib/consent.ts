import type { AstroCookies } from 'astro';

/**
 * Cookie-consent plumbing. Mirrors the `toRounded` / `toHeroAnimation` pattern:
 * a whitelist + a narrowing helper, plus thin read/write wrappers over Astro's
 * built-in cookies API (no custom parser).
 */
export const CONSENT_VALUES = ['essential', 'analytics'] as const;
export type Consent = (typeof CONSENT_VALUES)[number];

export const CONSENT_COOKIE = 'cookie_consent';
/** ~6 months — inside the requested 1–12 month window. */
export const CONSENT_MAX_AGE_S = 60 * 60 * 24 * 180;

/** Narrow a raw cookie value to a `Consent`, defaulting to `essential`. */
export function parseConsent(raw: unknown): Consent {
  return (CONSENT_VALUES as readonly string[]).includes(raw as string)
    ? (raw as Consent)
    : 'essential';
}

/** Current consent from the request cookies (`essential` when unset/invalid). */
export function readConsent(cookies: Pick<AstroCookies, 'get'>): Consent {
  return parseConsent(cookies.get(CONSENT_COOKIE)?.value);
}

/** Has the visitor made any choice yet? Drives whether the banner renders. */
export function hasConsentDecision(cookies: Pick<AstroCookies, 'has'>): boolean {
  return cookies.has(CONSENT_COOKIE);
}

/** Persist a consent choice via Astro's cookies API (value is normalised). */
export function writeConsent(cookies: Pick<AstroCookies, 'set'>, value: Consent): void {
  cookies.set(CONSENT_COOKIE, parseConsent(value), {
    path: '/',
    maxAge: CONSENT_MAX_AGE_S,
    sameSite: 'lax',
  });
}

/**
 * Analytics (Plausible) may load only with explicit `analytics` consent **and**
 * in production. Everything else — dev, test, `essential` consent, no cookie —
 * loads nothing.
 */
export function analyticsAllowed(consent: Consent, nodeEnv: string): boolean {
  return consent === 'analytics' && nodeEnv === 'production';
}
