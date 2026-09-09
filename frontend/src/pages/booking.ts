import type { APIRoute } from 'astro';

import { env } from '../env';
import { isBot, parseBooking } from '../lib/booking';
import { deliverToPayload } from '../lib/bookingDelivery';

export const prerender = false;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

/**
 * Booking enquiry sink. The client posts JSON (form-encoded also accepted for a
 * no-JS attempt). Requests are honeypot-filtered and structurally validated
 * here, then written to the Payload `bookings` collection.
 */
export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') ?? '';
  const raw: Record<string, unknown> = contentType.includes('application/json')
    ? await request.json().catch(() => ({}))
    : Object.fromEntries(await request.formData().catch(() => new FormData()));

  // Silently accept bots so the script doesn't tell them they were caught.
  if (isBot(raw)) return json(200, { ok: true });

  const parsed = parseBooking(raw);
  if (!parsed.ok) return json(422, parsed);

  const delivered = await deliverToPayload(env.PAYLOAD_INTERNAL_URL, parsed.data);
  if (!delivered) {
    console.error('[booking] delivery failed', { ...parsed.data, at: new Date().toISOString() });
    return json(502, { ok: false, error: 'delivery' });
  }
  return json(200, { ok: true });
};
