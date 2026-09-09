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
    const sizes = upload.imageSizes ?? [];
    expect(sizes.map((s) => s.name).sort()).toEqual(['card', 'hero', 'thumbnail']);

    const byName = (name: string) => {
      const found = sizes.find((s) => s.name === name);
      if (!found) throw new Error(`missing image size: ${name}`);
      return found;
    };
    expect(byName('thumbnail').width).toBe(400);
    expect(byName('card').width).toBe(768);
    expect(byName('hero').width).toBe(1600);

    for (const s of sizes) {
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
