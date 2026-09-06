import { describe, expect, it } from 'vitest';

import { withFallback } from './withFallback';

// Mirrors a real CMS section shape: every field is nullish off the wire.
interface Section {
  heading?: string | null;
  note?: string | null;
  items?: string[] | null;
  count?: number | null;
}

const FB: Section = { heading: 'FB heading', note: 'FB note', items: ['a', 'b'], count: 3 };

describe('withFallback', () => {
  it('returns a copy of the fallback when data is null/undefined', () => {
    expect(withFallback(null, FB)).toEqual(FB);
    expect(withFallback(undefined, FB)).toEqual(FB);
    expect(withFallback(null, FB)).not.toBe(FB);
  });

  it('overlays only the fields the CMS actually set', () => {
    const out = withFallback({ heading: 'CMS heading' }, FB);
    expect(out).toEqual({ ...FB, heading: 'CMS heading' });
  });

  it('treats null, undefined and "" as "not set"', () => {
    const out = withFallback({ heading: '', note: null, count: undefined }, FB);
    expect(out).toEqual(FB);
  });

  it('keeps falsy-but-real values (0, false)', () => {
    const out = withFallback({ count: 0 }, FB);
    expect(out.count).toBe(0);
  });

  it('ignores an empty array but takes a non-empty one whole', () => {
    expect(withFallback({ items: [] }, FB).items).toEqual(['a', 'b']);
    expect(withFallback({ items: ['x'] }, FB).items).toEqual(['x']);
  });

  it('does not mutate the fallback object', () => {
    const snapshot = structuredClone(FB);
    withFallback({ heading: 'changed', items: ['z'] }, FB);
    expect(FB).toEqual(snapshot);
  });
});
