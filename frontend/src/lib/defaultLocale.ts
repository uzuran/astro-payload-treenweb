import { DEFAULT_LOCALE, isLocale, pickDefaultLocale, type Locale } from './locale';
import { getSiteSettings } from './payload/client';

/**
 * The locale a prefix-less request (`/`) should land on.
 *
 * Source of truth is **SiteSettings → Default locale**, constrained to the
 * `SiteSettings.supportedLocales` entries that are enabled. The bundled
 * `DEFAULT_LOCALE` is only the bootstrap fallback — used when that global is
 * unset, holds an unroutable code, or the CMS is unreachable.
 */
export async function resolveDefaultLocale(): Promise<Locale> {
  try {
    const settings = await getSiteSettings();
    const enabled = (settings.supportedLocales ?? [])
      .filter((entry) => entry.enabled !== false)
      .map((entry) => entry.code)
      .filter(isLocale);
    return pickDefaultLocale(settings.defaultLocale, enabled);
  } catch {
    return DEFAULT_LOCALE;
  }
}
