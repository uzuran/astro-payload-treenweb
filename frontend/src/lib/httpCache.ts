/**
 * Cache-Control for SSR HTML, applied in `middleware.ts`.
 *
 * The rendered HTML varies by cookie — the consent banner shows only until
 * `cookie_consent` is set, and a future locale preference would read a cookie
 * too. So a shared cache (CDN) may hold the response only for a **cookieless**
 * first-time visitor; anyone carrying a cookie gets a private, unstored
 * response, otherwise the CDN could hand one visitor another's banner state.
 */
export function htmlCacheControl(hasCookie: boolean): string {
  return hasCookie
    ? 'private, no-store'
    : 'public, max-age=0, s-maxage=60, stale-while-revalidate=600';
}

/** Add `Cookie` to an existing `Vary` value without duplicating a token. */
export function withVaryCookie(current: string | null): string {
  const tokens = new Set(
    (current ?? '')
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean),
  );
  tokens.add('Cookie');
  return [...tokens].join(', ');
}
