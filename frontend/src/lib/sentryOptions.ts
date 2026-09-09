/** Pure Sentry-config helper — no `@sentry/node` import, so it is cheap to test. */

export interface SentryOptions {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
}

export interface SentryEnv {
  SENTRY_DSN?: string;
  SENTRY_ENVIRONMENT: string;
  SENTRY_TRACES_SAMPLE_RATE: number;
  NODE_ENV: string;
}

/** Init options, or `null` when Sentry must stay off (no DSN, or not production). */
export function sentryInitOptions(e: SentryEnv): SentryOptions | null {
  if (!e.SENTRY_DSN || e.NODE_ENV !== 'production') return null;
  return {
    dsn: e.SENTRY_DSN,
    environment: e.SENTRY_ENVIRONMENT,
    tracesSampleRate: e.SENTRY_TRACES_SAMPLE_RATE,
  };
}
