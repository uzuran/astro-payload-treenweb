import { type Locale, localizedPath } from './locale';

/**
 * Resolve a nav link's `href`. Hash links (`#about`, `#booking`) only anchor on
 * the home page, so prefix them with the locale root — `#about` → `/en/#about` —
 * so they still work from a content page. Everything else passes through.
 */
export function resolveNavHref(href: string, locale: Locale): string {
  return href.startsWith('#') ? `${localizedPath(locale, '/')}${href}` : href;
}
