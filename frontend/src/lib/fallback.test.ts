import { describe, expect, it } from 'vitest';

import { getFallback } from './fallback';

describe('getFallback', () => {
  it('returns a template-neutral placeholder shape', () => {
    const fb = getFallback('ru');
    expect(fb.nav).toEqual([]);
    expect(fb.site.siteName).toBe('');
    expect(fb.site.contact).toEqual({});
  });

  it('is locale-neutral (same object for any locale)', () => {
    expect(getFallback('en')).toBe(getFallback('cs'));
  });
});
