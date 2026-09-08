import { describe, expect, it } from 'vitest';

import { htmlCacheControl, withVaryCookie } from './httpCache';

describe('htmlCacheControl', () => {
  it('lets a shared cache hold the cookieless first-visit response', () => {
    expect(htmlCacheControl(false)).toBe(
      'public, max-age=0, s-maxage=60, stale-while-revalidate=600',
    );
  });

  it('keeps a cookied visitor’s response private and unstored', () => {
    expect(htmlCacheControl(true)).toBe('private, no-store');
    expect(htmlCacheControl(true)).not.toContain('s-maxage');
  });
});

describe('withVaryCookie', () => {
  it('sets Cookie when there is no existing Vary', () => {
    expect(withVaryCookie(null)).toBe('Cookie');
    expect(withVaryCookie('')).toBe('Cookie');
  });

  it('appends Cookie to an existing Vary', () => {
    expect(withVaryCookie('Accept-Encoding')).toBe('Accept-Encoding, Cookie');
  });

  it('does not duplicate Cookie regardless of spacing/case position', () => {
    expect(withVaryCookie('Cookie')).toBe('Cookie');
    expect(withVaryCookie('Accept-Encoding, Cookie')).toBe('Accept-Encoding, Cookie');
    expect(withVaryCookie('Accept-Encoding,Cookie')).toBe('Accept-Encoding, Cookie');
  });
});
