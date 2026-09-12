import { describe, expect, it } from 'vitest';

import { vescoPath } from './vescoPath';

describe('vescoPath', () => {
  it('builds the home URL for each locale', () => {
    expect(vescoPath('en', 'home')).toBe('/en');
    expect(vescoPath('cs', 'home')).toBe('/cs');
  });

  it('builds a sub-page URL for each locale', () => {
    expect(vescoPath('en', 'tarot')).toBe('/en/tarot');
    expect(vescoPath('cs', 'tarot')).toBe('/cs/tarot');
    expect(vescoPath('en', 'horoscope')).toBe('/en/horoscope');
    expect(vescoPath('cs', 'numerology')).toBe('/cs/numerology');
    expect(vescoPath('en', 'dashboard')).toBe('/en/dashboard');
  });
});
