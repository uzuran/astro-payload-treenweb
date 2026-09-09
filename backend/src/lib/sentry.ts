import * as Sentry from '@sentry/node';

import { env } from '../env';
import { sentryInitOptions } from './sentryOptions';

let started = false;

/** Called once from instrumentation.register() on the Node.js runtime. */
export function initSentry(): void {
  if (started) return;
  const options = sentryInitOptions(env);
  if (!options) return;
  Sentry.init({
    ...options,
    // Error capture + crash handlers only — no HTTP/OTEL auto-instrumentation
    // that could interfere with Next.js / Payload internals.
    defaultIntegrations: false,
    integrations: [
      Sentry.onUncaughtExceptionIntegration(),
      Sentry.onUnhandledRejectionIntegration(),
      Sentry.dedupeIntegration(),
    ],
  });
  started = true;
}

export function captureError(error: unknown): void {
  Sentry.captureException(error);
}
