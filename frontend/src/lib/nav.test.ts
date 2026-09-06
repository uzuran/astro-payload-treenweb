import { describe, expect, it } from 'vitest';

import { resolveNavHref } from './nav';

describe('resolveNavHref', () => {
  it('prefixes a hash link with the locale root (no trailing slash)', () => {
    expect(resolveNavHref('#about', 'en')).toBe('/en#about');
    expect(resolveNavHref('#booking', 'ru')).toBe('/ru#booking');
    expect(resolveNavHref('#contacts', 'cs')).toBe('/cs#contacts');
  });

  it('passes an absolute path through unchanged', () => {
    expect(resolveNavHref('/about', 'en')).toBe('/about');
    expect(resolveNavHref('/en/blog', 'cs')).toBe('/en/blog');
  });

  it('passes an external URL through unchanged', () => {
    expect(resolveNavHref('https://example.com', 'en')).toBe('https://example.com');
  });
});
