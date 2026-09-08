import type { APIRoute } from 'astro';

import { parseConsent, safeNextPath, writeConsent } from '../lib/consent';

export const prerender = false;

/**
 * No-JS fallback for the cookie banner (components/CookieConsent.astro). The
 * `<form>` POSTs `value` + `next`; we persist the choice with the shared
 * `writeConsent` helper and bounce back to the page the visitor was on
 * (`safeNextPath` rejects any off-site `next`). With JS the banner handles the
 * click itself and never reaches here.
 */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  writeConsent(cookies, parseConsent(form.get('value')));
  return redirect(safeNextPath(form.get('next')), 303);
};
