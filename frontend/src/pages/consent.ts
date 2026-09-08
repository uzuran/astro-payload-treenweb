import type { APIRoute } from 'astro';

import { parseConsent, writeConsent } from '../lib/consent';

export const prerender = false;

/**
 * No-JS fallback for the cookie banner (components/CookieConsent.astro). The
 * `<form>` POSTs `value` + `next`; we persist the choice with the shared
 * `writeConsent` helper and bounce back to the page the visitor was on. With
 * JS the banner handles the click itself and never reaches here.
 */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  writeConsent(cookies, parseConsent(form.get('value')));

  // Only ever redirect to a local path.
  const next = String(form.get('next') ?? '/');
  const safe = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  return redirect(safe, 303);
};
