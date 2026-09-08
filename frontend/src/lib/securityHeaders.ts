import { env } from '../env';

/**
 * Defense-in-depth response headers, applied in `middleware.ts`. The edge proxy
 * sets the authoritative set in prod; these keep direct-origin + dev requests
 * safe. Static values only — no policy "builder".
 */
export const BASE_SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

/** HSTS — only sent in production (never from http://localhost). 2 years. */
export const HSTS_HEADER = 'max-age=63072000; includeSubDomains; preload';

/**
 * Content-Security-Policy.
 *
 * `script-src` is `'self'` only: every executable script Astro emits is a
 * bundled `/_astro/*` module. The one `is:inline` block is JSON-LD
 * (`type="application/ld+json"`, a non-executed data block CSP ignores). Adding
 * a framework island with `client:*` would introduce a hydration inline script —
 * switch to Astro's `experimental.csp` hashing then, don't re-add `'unsafe-inline'`.
 *
 * `style-src` keeps `'unsafe-inline'`: Astro inlines small scoped `<style>`
 * blocks and components use `style=""` attributes (e.g. the hero duration var).
 * Removing it also needs `experimental.csp`.
 *
 * A third-party analytics host, if ever used instead of self-hosted Plausible,
 * must be added to `script-src` / `connect-src`.
 */
export function contentSecurityPolicy(): string {
  const cms = new URL(env.PUBLIC_CMS_URL).origin;
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: ${cms}`,
    `connect-src 'self' ${cms}`,
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}
