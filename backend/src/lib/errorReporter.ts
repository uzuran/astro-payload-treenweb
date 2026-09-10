import { env } from '../env';

/**
 * Minimal backend error alerting: forwards server-side (5xx-class) errors to
 * `ALERT_WEBHOOK_URL`, throttled so a hammering client can't spam the channel.
 * Fire-and-forget — never throws, never blocks the response.
 *
 * Not a replacement for full APM (`@sentry/nextjs`); it just means an unhandled
 * backend error is noticed.
 */
const THROTTLE_MS = 5 * 60 * 1000;
const seen = new Map<string, number>();

/** Test seam. */
export function _resetThrottle(): void {
  seen.clear();
}

export interface ReportableError {
  message?: string;
  name?: string;
  status?: number;
  stack?: string;
}

/** Server faults only — skip 4xx / validation errors. */
export function shouldReport(error: ReportableError): boolean {
  const status = typeof error.status === 'number' ? error.status : 500;
  return status >= 500;
}

/**
 * The alert text for an error, or `null` when it shouldn't fire (4xx, or the
 * same error already alerted within the throttle window).
 */
export function buildAlert(error: unknown, now: number = Date.now()): string | null {
  const e = (error ?? {}) as ReportableError;
  if (!shouldReport(e)) return null;

  const key = `${e.name ?? 'Error'}:${e.message ?? ''}`.slice(0, 200);
  const last = seen.get(key);
  if (last !== undefined && now - last < THROTTLE_MS) return null;
  if (seen.size > 200) seen.clear();
  seen.set(key, now);

  return [
    `🔴 ${env.SENTRY_ENVIRONMENT || 'backend'} error`,
    `${e.name ?? 'Error'}: ${e.message ?? String(error)}`,
    (e.stack ?? '').split('\n').slice(1, 4).join('\n'),
  ]
    .filter(Boolean)
    .join('\n');
}

export async function reportError(error: unknown): Promise<void> {
  const url = env.ALERT_WEBHOOK_URL;
  if (!url) return;
  const text = buildAlert(error);
  if (!text) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, content: text }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* alerting is best-effort */
  }
}
