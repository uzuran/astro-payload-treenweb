/**
 * The one place locale codes live.
 *
 * `payload.config.ts` (`localization.locales`), the seed, and the SiteSettings
 * `defaultLocale` select all derive from this. The Astro frontend mirrors the
 * same list via `PUBLIC_SUPPORTED_LOCALES` / `PUBLIC_DEFAULT_LOCALE`.
 *
 * Adding a locale: add it here, run `migrate:create`, then translate content.
 * These codes MUST stay in sync everywhere or Payload returns 400 / Astro 404s.
 */
export const LOCALES = ['cs', 'en', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ru';

export const LOCALE_LABELS: Record<Locale, string> = {
  cs: 'Čeština',
  en: 'English',
  ru: 'Русский',
};

/** `{ label, value }[]` for a Payload `select` field's `options`. */
export const localeSelectOptions = LOCALES.map((code) => ({
  label: LOCALE_LABELS[code],
  value: code,
}));

/** Full `supportedLocales` array value, all enabled — used by the seed. */
export const supportedLocalesSeed = LOCALES.map((code) => ({
  code,
  label: LOCALE_LABELS[code],
  enabled: true,
}));
