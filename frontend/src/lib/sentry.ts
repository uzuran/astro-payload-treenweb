import * as Sentry from '@sentry/node';

import { env } from '../env';
import { sentryInitOptions } from './sentryOptions';

// One-time init on server start (middleware imports this module). Error capture
// + crash handlers only — no HTTP/OTEL auto-instrumentation.
const options = sentryInitOptions(env);
if (options) {
  Sentry.init({
    ...options,
    defaultIntegrations: false,
    integrations: [
      Sentry.onUncaughtExceptionIntegration(),
      Sentry.onUnhandledRejectionIntegration(),
      Sentry.dedupeIntegration(),
      Sentry.contextLinesIntegration(),
    ],
  });
}

export { Sentry };
