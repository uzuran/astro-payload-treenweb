import { defineMiddleware } from 'astro:middleware';

/**
 * Defense-in-depth response headers + conservative caching for HTML.
 * Traefik sets the authoritative security headers in Step 8.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const headers = response.headers;

  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  if (context.request.method === 'GET' && !headers.has('Cache-Control')) {
    const contentType = headers.get('Content-Type') ?? '';
    if (contentType.includes('text/html')) {
      headers.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
    }
  }

  return response;
});
