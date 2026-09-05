import { DEFAULT_LOCALE, type Locale, localizedPath } from '../locale';
import { env } from '../../env';
import type { Alternate } from './buildMeta';

const abs = (path: string) => new URL(path, env.PUBLIC_SITE_URL).href;

/**
 * hreflang alternates for a locale-less base path (`/`, `/about`, `/posts/x`).
 * One entry per enabled locale + `x-default` -> the default locale. Empty when
 * ≤1 locale is offered. Single source of truth — the page <head> and
 * sitemap.xml both use this so they can never drift.
 *
 * Assumes shared slugs across locales (slugField is NOT localized). If that
 * ever changes, this and the sitemap need per-locale slug resolution.
 */
export function buildAlternates(basePath: string, enabled: Locale[]): Alternate[] {
  if (enabled.length <= 1) return [];
  return [
    ...enabled.map((code) => ({ hreflang: code, href: abs(localizedPath(code, basePath)) })),
    { hreflang: 'x-default', href: abs(localizedPath(DEFAULT_LOCALE, basePath)) },
  ];
}

/** The other enabled locales — for og:locale:alternate. */
export function otherLocales(current: Locale, enabled: Locale[]): string[] {
  return enabled.filter((code) => code !== current);
}
