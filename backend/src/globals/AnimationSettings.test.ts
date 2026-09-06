import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { AnimationSettings } from './AnimationSettings';

describe('AnimationSettings global', () => {
  it('is the `animation-settings` global', () => {
    expect(AnimationSettings.slug).toBe('animation-settings');
  });

  it('has a shared numeric `duration` field: default 1.2, clamped 0.2–5', () => {
    const f = (AnimationSettings.fields as Field[]).find(
      (x) => (x as { name?: string }).name === 'duration',
    ) as Record<string, unknown> | undefined;

    expect(f?.type).toBe('number');
    expect(f?.defaultValue).toBe(1.2);
    expect(f?.min).toBe(0.2);
    expect(f?.max).toBe(5);
    expect(Boolean(f?.localized)).toBe(false);
  });
});
