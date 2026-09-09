import { describe, expect, it } from 'vitest';

import { type SentryEnv, sentryInitOptions } from './sentryOptions';

const base: SentryEnv = {
  SENTRY_DSN: 'https://key@o1.ingest.sentry.io/1',
  SENTRY_ENVIRONMENT: 'production',
  SENTRY_TRACES_SAMPLE_RATE: 0.1,
  NODE_ENV: 'production',
};

describe('sentryInitOptions', () => {
  it('returns the options when a DSN is set in production', () => {
    expect(sentryInitOptions(base)).toEqual({
      dsn: base.SENTRY_DSN,
      environment: 'production',
      tracesSampleRate: 0.1,
    });
  });

  it('stays off without a DSN', () => {
    expect(sentryInitOptions({ ...base, SENTRY_DSN: undefined })).toBeNull();
    expect(sentryInitOptions({ ...base, SENTRY_DSN: '' })).toBeNull();
  });

  it('stays off outside production', () => {
    for (const NODE_ENV of ['development', 'test', 'staging']) {
      expect(sentryInitOptions({ ...base, NODE_ENV }), NODE_ENV).toBeNull();
    }
  });
});
