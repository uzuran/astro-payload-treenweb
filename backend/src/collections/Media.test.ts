import { describe, expect, it } from 'vitest';

import { Media } from './Media';

describe('Media upload config', () => {
  const upload = Media.upload as Exclude<typeof Media.upload, boolean | undefined>;

  it('excludes SVG (script-injection vector)', () => {
    expect(upload.mimeTypes).not.toContain('image/svg+xml');
    expect(upload.mimeTypes).toEqual(
      expect.arrayContaining(['image/png', 'image/jpeg', 'image/webp', 'image/avif']),
    );
  });

  it('defines thumbnail / card / hero widths, WebP-encoded, never upscaled', () => {
    const sizes = Object.fromEntries((upload.imageSizes ?? []).map((s) => [s.name, s]));
    expect(Object.keys(sizes).sort()).toEqual(['card', 'hero', 'thumbnail']);
    expect(sizes.thumbnail.width).toBe(400);
    expect(sizes.card.width).toBe(768);
    expect(sizes.hero.width).toBe(1600);
    for (const s of Object.values(sizes)) {
      expect(s.formatOptions?.format).toBe('webp');
      expect(s.withoutEnlargement).toBe(true);
    }
  });
});

describe('Media fields', () => {
  it('requires a localized alt text', () => {
    const alt = (Media.fields as { name?: string; required?: boolean; localized?: boolean }[]).find(
      (f) => f.name === 'alt',
    );
    expect(alt?.required).toBe(true);
    expect(alt?.localized).toBe(true);
  });
});
