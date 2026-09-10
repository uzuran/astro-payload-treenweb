import { afterEach, describe, expect, it } from 'vitest';

import { _resetThrottle, buildAlert, shouldReport } from './errorReporter';

afterEach(() => _resetThrottle());

describe('shouldReport', () => {
  it('reports 5xx and status-less errors', () => {
    expect(shouldReport({ status: 500 })).toBe(true);
    expect(shouldReport({ status: 502 })).toBe(true);
    expect(shouldReport({})).toBe(true);
  });

  it('skips 4xx / validation errors', () => {
    for (const status of [400, 401, 403, 404, 409, 422]) {
      expect(shouldReport({ status }), String(status)).toBe(false);
    }
  });
});

describe('buildAlert', () => {
  it('formats a 5xx error with name, message and a little stack', () => {
    const text = buildAlert({
      name: 'TypeError',
      message: 'boom',
      stack: 'TypeError: boom\n  at a\n  at b',
    });
    expect(text).toContain('TypeError: boom');
    expect(text).toContain('at a');
  });

  it('returns null for a 4xx', () => {
    expect(buildAlert({ status: 404, message: 'nope' })).toBeNull();
  });

  it('throttles the same error within the window, then fires again after it', () => {
    const t0 = 1_000_000;
    expect(buildAlert({ message: 'db down' }, t0)).not.toBeNull();
    expect(buildAlert({ message: 'db down' }, t0 + 60_000)).toBeNull();
    expect(buildAlert({ message: 'db down' }, t0 + 6 * 60_000)).not.toBeNull();
  });

  it('does not throttle across distinct errors', () => {
    const t = 2_000_000;
    expect(buildAlert({ message: 'a' }, t)).not.toBeNull();
    expect(buildAlert({ message: 'b' }, t)).not.toBeNull();
  });
});
