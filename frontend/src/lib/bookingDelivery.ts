import type { BookingInput } from './booking';

const TIMEOUT_MS = 6_000;

/**
 * Persist a validated enquiry as a Payload `bookings` document. Server-to-server
 * over the internal URL; the collection's `create` access is public so no auth
 * is sent. Returns whether it landed — the caller decides what to tell the user.
 */
export async function deliverToPayload(cmsBaseUrl: string, data: BookingInput): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(new URL('/api/bookings', cmsBaseUrl), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...data, source: 'website' }),
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
