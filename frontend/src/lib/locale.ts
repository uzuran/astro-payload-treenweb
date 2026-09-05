/**
 * Locale plumbing for a currently single-language site. Payload localization
 * is NOT enabled — this only drives `<html lang>` / `dir` and lets the meta
 * builder carry hreflang alternates once a second locale is added.
 */
export const DEFAULT_LOCALE = 'ru';

const RTL_LOCALES = new Set(['ar', 'fa', 'he', 'ur']);

/** Writing direction for a BCP-47 locale tag (LTR for everything we ship today). */
export function dirFor(locale: string): 'ltr' | 'rtl' {
  const base = locale.split('-')[0]?.toLowerCase() ?? '';
  return RTL_LOCALES.has(base) ? 'rtl' : 'ltr';
}
