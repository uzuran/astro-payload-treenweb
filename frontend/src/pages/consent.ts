import type { APIRoute } from 'astro';

import { clearConsent, parseConsent, safeNextPath, writeConsent } from '../lib/consent';

export const prerender = false;

/**
 * No-JS path for the cookie banner (components/CookieConsent.astro) and the
 * footer's "manage consent" control. The `<form>` POSTs `value` + `next`:
 * `essential` / `analytics` persist a choice; `reset` withdraws it so the
 * banner asks again. Then we bounce back to the page the visitor was on
 * (`safeNextPath` rejects any off-site `next`). With JS the banner handles the
 * click itself and never reaches here.
 */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  if (form.get('value') === 'reset') {
    clearConsent(cookies);
  } else {
    writeConsent(cookies, parseConsent(form.get('value')));
  }
  return redirect(safeNextPath(form.get('next')), 303);
};
