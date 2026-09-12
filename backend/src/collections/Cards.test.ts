import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated';
import { Cards } from './Cards';

const byName = (fields: Field[], name: string) =>
  fields.find((f) => (f as { name?: string }).name === name) as Record<string, unknown> | undefined;

describe('Cards', () => {
  it('publishes drafts and is publicly readable when published, locked down to write', () => {
    expect(Cards.versions).toMatchObject({ drafts: true });
    expect(Cards.access?.read).toBe(publishedOrAuthenticated);
    expect(typeof Cards.access?.create).toBe('function');
    expect(typeof Cards.access?.update).toBe('function');
    expect(typeof Cards.access?.delete).toBe('function');
  });

  it('has a required relationship to card-packs', () => {
    const pack = byName(Cards.fields, 'pack');
    expect(pack).toMatchObject({ type: 'relationship', relationTo: 'card-packs', required: true });
  });

  it('has a localized name and upright/reversed meanings', () => {
    const name = byName(Cards.fields, 'name');
    const upright = byName(Cards.fields, 'meaningUpright');
    const reversed = byName(Cards.fields, 'meaningReversed');
    expect(name).toMatchObject({ type: 'text', required: true, localized: true });
    expect(upright).toMatchObject({ type: 'textarea', localized: true });
    expect(reversed).toMatchObject({ type: 'textarea', localized: true });
  });

  it('has a required image upload, a numeric order, and a tags array', () => {
    const image = byName(Cards.fields, 'image');
    const order = byName(Cards.fields, 'order');
    const tags = byName(Cards.fields, 'tags');
    expect(image).toMatchObject({ type: 'upload', relationTo: 'media', required: true });
    expect(order).toMatchObject({ type: 'number', defaultValue: 0 });
    expect(tags?.type).toBe('array');
    expect((tags?.fields as Field[])[0]).toMatchObject({
      name: 'tag',
      type: 'text',
      required: true,
    });
  });
});
