// Next.js instrumentation hook — runs once before the app boots, and again per
// request error. Sentry stays a no-op unless SENTRY_DSN is set and NODE_ENV is
// production (see src/lib/sentry.ts).

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { initSentry } = await import('./lib/sentry');
  initSentry();
}

/** Next calls this for uncaught errors in RSC / route handlers / server actions. */
export async function onRequestError(error: unknown): Promise<void> {
  const { captureError } = await import('./lib/sentry');
  captureError(error);
}
