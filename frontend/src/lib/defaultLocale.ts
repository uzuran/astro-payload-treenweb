import { assertLocale, DEFAULT_LOCALE, type Locale } from './locale';
import { getSiteSettings } from './payload/client';

/**
 * The locale a prefix-less request (`/`) should land on.
 *
 * Source of truth is **SiteSettings → Default locale** in the Payload admin.
 * The bundled `DEFAULT_LOCALE` is only a bootstrap fallback — used when that
 * global is unset, holds an unroutable code, or the CMS is unreachable.
 */
export async function resolveDefaultLocale(): Promise<Locale> {
  try {
    const settings = await getSiteSettings();
    return assertLocale(settings.defaultLocale);
  } catch {
    return DEFAULT_LOCALE;
  }
}
