/**
 * Frontend locale plumbing.
 *
 * `LOCALES` is the physically routable set (the `src/pages/[locale]/**` prefixes
 * the middleware accepts) — it MUST match `backend/src/locales.ts`.
 *
 * `DEFAULT_LOCALE` is only the bootstrap fallback: the locale used when the CMS
 * is unreachable or a stored code is unroutable. The live default that a
 * prefix-less `/` redirects to is `SiteSettings.defaultLocale` (Payload admin,
 * source of truth) — see `resolveDefaultLocale` in `./defaultLocale`.
 *
 * Which locales are actually offered (switcher, hreflang, sitemap) is a further
 * runtime toggle read from `SiteSettings.supportedLocales[].enabled`.
 */
export const LOCALES = ['ru', 'en', 'cs'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ru';

export const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'Русский',
  en: 'English',
  cs: 'Čeština',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Narrow an unknown (e.g. `Astro.currentLocale`) to a Locale, else the default. */
export function assertLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

const RTL_LOCALES = new Set(['ar', 'fa', 'he', 'ur']);

/** Writing direction for a BCP-47 locale tag (LTR for everything we ship today). */
export function dirFor(locale: string): 'ltr' | 'rtl' {
  const base = locale.split('-')[0]?.toLowerCase() ?? '';
  return RTL_LOCALES.has(base) ? 'rtl' : 'ltr';
}

/**
 * Drop a leading `/<locale>` segment.
 *   `/en/about` -> `/about` · `/en` -> `/` · `/about` -> `/about`
 */
export function stripLocale(pathname: string): string {
  const match = /^\/([^/]+)(\/.*)?$/.exec(pathname);
  if (match && isLocale(match[1])) return match[2] || '/';
  return pathname || '/';
}

/**
 * Prefix a locale onto a locale-less path (all locales are prefixed —
 * `prefixDefaultLocale: true`).
 *   `('en', '/about')` -> `/en/about` · `('ru', '/')` -> `/ru`
 */
export function localizedPath(locale: Locale, pathname: string): string {
  const rest = stripLocale(pathname);
  return rest === '/' ? `/${locale}` : `/${locale}${rest}`;
}
