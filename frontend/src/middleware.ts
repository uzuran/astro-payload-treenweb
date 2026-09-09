import { defineMiddleware } from 'astro:middleware';

import { env } from './env';
import { htmlCacheControl, withVaryCookie } from './lib/httpCache';
import { DEFAULT_LOCALE, isLocale, type Locale } from './lib/locale';
import { Sentry } from './lib/sentry';
import { BASE_SECURITY_HEADERS, contentSecurityPolicy, HSTS_HEADER } from './lib/securityHeaders';

declare global {
  namespace App {
    interface Locals {
      /** Validated route locale, set below. */
      locale: Locale;
    }
  }
}

/**
 * 1. Locale validation for the `/[locale]/**` tree — Payload is lenient, Astro
 *    isn't. Unknown/disabled prefixes 404 here rather than rendering fallback
 *    content under a bogus `<html lang>`.
 * 2. Defense-in-depth response headers + conservative HTML caching.
 *    Traefik sets the authoritative security headers in Step 8.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  // `locale` param is present only when a `src/pages/[locale]/**` route matched.
  const routeLocale = context.params.locale;
  if (routeLocale !== undefined && !isLocale(routeLocale)) {
    return new Response('Not found', { status: 404 });
  }
  context.locals.locale = isLocale(routeLocale) ? routeLocale : DEFAULT_LOCALE;

  let response: Response;
  try {
    response = await next();
  } catch (error) {
    // A no-op unless Sentry was initialised (SENTRY_DSN + production).
    Sentry.captureException(error);
    throw error;
  }
  const headers = response.headers;

  if (routeLocale !== undefined) {
    headers.set('Content-Language', context.locals.locale);
    // Remember the served locale so a future prefix-less visit can honour it.
    context.cookies.set('locale', context.locals.locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 180, // ~6 months, inside the 1–12 month window
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
    });
  }

  for (const [name, value] of Object.entries(BASE_SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  headers.set('Content-Security-Policy', contentSecurityPolicy());
  if (env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', HSTS_HEADER);
  }

  if (context.request.method === 'GET' && !headers.has('Cache-Control')) {
    const contentType = headers.get('Content-Type') ?? '';
    if (contentType.includes('text/html')) {
      headers.set('Cache-Control', htmlCacheControl(context.request.headers.has('cookie')));
      headers.set('Vary', withVaryCookie(headers.get('Vary')));
    }
  }

  return response;
});
