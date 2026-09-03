import { describe, expect, it } from 'vitest';

import { formatSlug } from './formatSlug';

describe('formatSlug', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(formatSlug('Hello World')).toBe('hello-world');
  });
  it('strips punctuation and collapses separators', () => {
    expect(formatSlug('  Foo: Bar__Baz!! ')).toBe('foo-bar-baz');
  });
  it('trims leading/trailing hyphens', () => {
    expect(formatSlug('--edge--case--')).toBe('edge-case');
  });
});
