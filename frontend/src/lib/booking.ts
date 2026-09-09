/**
 * Booking-enquiry validation, shared by the `/booking` endpoint and covered by
 * unit tests. Structural checks only — no CMS coupling; the `<select>`s already
 * constrain `service` / `master` in the browser.
 */
export const HONEYPOT_FIELD = 'company';

export interface BookingInput {
  name: string;
  phone: string;
  service: string;
  master: string | null;
  date: string; // YYYY-MM-DD
}

export type BookingResult =
  | { ok: true; data: BookingInput }
  | { ok: false; errors: Partial<Record<keyof BookingInput, 'required' | 'invalid'>> };

const PHONE_RE = /^[+0-9 ()-]{9,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** The honeypot field is off-screen; a real visitor never fills it. */
export function isBot(raw: Record<string, unknown>): boolean {
  return str(raw[HONEYPOT_FIELD]) !== '';
}

/** A real calendar date (rejects e.g. 2030-02-31), today or later (1-day grace for TZ skew). */
function isBookableDate(iso: string, now: Date): boolean {
  if (!DATE_RE.test(iso)) return false;
  const t = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== iso) return false;
  const floor = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 86_400_000;
  return t >= floor;
}

export function parseBooking(raw: Record<string, unknown>, now = new Date()): BookingResult {
  const name = str(raw.name);
  const phone = str(raw.phone);
  const service = str(raw.service);
  const master = str(raw.master) || null;
  const date = str(raw.date);

  const errors: Partial<Record<keyof BookingInput, 'required' | 'invalid'>> = {};
  if (name.length < 1 || name.length > 100) errors.name = 'required';
  if (!PHONE_RE.test(phone)) errors.phone = 'invalid';
  if (service.length < 1 || service.length > 100) errors.service = 'required';
  if (master !== null && master.length > 100) errors.master = 'invalid';
  if (!isBookableDate(date, now)) errors.date = 'invalid';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { name, phone, service, master, date } };
}
