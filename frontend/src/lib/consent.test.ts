import { describe, expect, it, vi } from 'vitest';

import {
  analyticsAllowed,
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_S,
  CONSENT_VALUES,
  hasConsentDecision,
  parseConsent,
  readConsent,
  writeConsent,
} from './consent';

describe('parseConsent', () => {
  it('passes the two valid values through', () => {
    expect(parseConsent('essential')).toBe('essential');
    expect(parseConsent('analytics')).toBe('analytics');
  });

  it('defaults to "essential" for anything else', () => {
    for (const v of ['ANALYTICS', 'all', '', ' analytics', undefined, null, 1, {}, ['analytics']]) {
      expect(parseConsent(v), JSON.stringify(v)).toBe('essential');
    }
  });
});

describe('readConsent / hasConsentDecision', () => {
  it('reads and normalises the cookie value', () => {
    expect(readConsent({ get: () => ({ value: 'analytics' }) as never })).toBe('analytics');
    expect(readConsent({ get: () => ({ value: 'garbage' }) as never })).toBe('essential');
    expect(readConsent({ get: () => undefined })).toBe('essential');
  });

  it('reports whether a decision cookie exists', () => {
    expect(hasConsentDecision({ has: (n) => n === CONSENT_COOKIE })).toBe(true);
    expect(hasConsentDecision({ has: () => false })).toBe(false);
  });
});

describe('writeConsent', () => {
  it('writes the normalised value with path/maxAge/sameSite', () => {
    const set = vi.fn();
    writeConsent({ set }, 'analytics');
    expect(set).toHaveBeenCalledWith(CONSENT_COOKIE, 'analytics', {
      path: '/',
      maxAge: CONSENT_MAX_AGE_S,
      sameSite: 'lax',
    });
  });

  it('normalises an out-of-range value before persisting', () => {
    const set = vi.fn();
    // @ts-expect-error — deliberately bad value
    writeConsent({ set }, 'everything');
    expect(set).toHaveBeenCalledWith(CONSENT_COOKIE, 'essential', expect.anything());
  });

  it('the cookie lifetime sits inside the 1–12 month window', () => {
    const month = 60 * 60 * 24 * 30;
    expect(CONSENT_MAX_AGE_S).toBeGreaterThanOrEqual(month);
    expect(CONSENT_MAX_AGE_S).toBeLessThanOrEqual(12 * month);
  });
});

describe('analyticsAllowed', () => {
  it('is true only for `analytics` consent in production', () => {
    expect(analyticsAllowed('analytics', 'production')).toBe(true);
  });

  it('is false for every other combination', () => {
    for (const c of CONSENT_VALUES) {
      for (const envName of ['development', 'test', 'staging', 'production']) {
        const expected = c === 'analytics' && envName === 'production';
        expect(analyticsAllowed(c, envName), `${c} / ${envName}`).toBe(expected);
      }
    }
  });
});
