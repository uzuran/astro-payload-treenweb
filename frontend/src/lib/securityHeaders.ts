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
 * Content-Security-Policy. `'unsafe-inline'` is unavoidable here: Astro emits
 * `is:inline` scripts (JSON-LD, the hero guard) and Tailwind injects inline
 * <style>. Everything else is same-origin plus the CMS media/API origin. A
 * third-party analytics host, if ever used instead of self-hosted Plausible,
 * must be added to `script-src` / `connect-src`.
 */
export function contentSecurityPolicy(): string {
  const cms = new URL(env.PUBLIC_CMS_URL).origin;
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
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
