import { describe, expect, it } from 'vitest';

import { BASE_SECURITY_HEADERS, contentSecurityPolicy, HSTS_HEADER } from './securityHeaders';

describe('BASE_SECURITY_HEADERS', () => {
  it('has the expected static hardening headers', () => {
    expect(BASE_SECURITY_HEADERS).toEqual({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    });
  });
});

describe('HSTS_HEADER', () => {
  it('is at least one year with includeSubDomains + preload', () => {
    const maxAge = Number(HSTS_HEADER.match(/max-age=(\d+)/)?.[1]);
    expect(maxAge).toBeGreaterThanOrEqual(31_536_000);
    expect(HSTS_HEADER).toContain('includeSubDomains');
    expect(HSTS_HEADER).toContain('preload');
  });
});

describe('contentSecurityPolicy', () => {
  const csp = contentSecurityPolicy();
  const directive = (name: string) =>
    csp
      .split(';')
      .map((d) => d.trim())
      .find((d) => d === name || d.startsWith(`${name} `));

  it('locks the baseline down to same-origin', () => {
    expect(directive('default-src')).toBe("default-src 'self'");
    expect(directive('object-src')).toBe("object-src 'none'");
    expect(directive('base-uri')).toBe("base-uri 'self'");
    expect(directive('form-action')).toBe("form-action 'self'");
    expect(directive('frame-ancestors')).toBe("frame-ancestors 'none'");
  });

  it('allows inline scripts/styles (Astro is:inline + Tailwind) but never eval', () => {
    expect(directive('script-src')).toBe("script-src 'self' 'unsafe-inline'");
    expect(directive('style-src')).toBe("style-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain('*');
  });

  it('permits CMS media + API and data: images, nothing wider', () => {
    expect(directive('img-src')).toMatch(/^img-src 'self' data: https?:\/\/[^ ]+$/);
    expect(directive('connect-src')).toMatch(/^connect-src 'self' https?:\/\/[^ ]+$/);
    expect(directive('font-src')).toBe("font-src 'self'");
  });

  it('upgrades insecure requests', () => {
    expect(directive('upgrade-insecure-requests')).toBe('upgrade-insecure-requests');
  });
});
