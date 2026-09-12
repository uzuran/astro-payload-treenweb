import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated';
import { CardPacks } from './CardPacks';

const byName = (fields: Field[], name: string) =>
  fields.find((f) => (f as { name?: string }).name === name) as Record<string, unknown> | undefined;

describe('CardPacks', () => {
  it('publishes drafts (versions.drafts) so publishedOrAuthenticated has _status to check', () => {
    expect(CardPacks.versions).toMatchObject({ drafts: true });
  });

  it('is publicly readable when published, locked down to write', () => {
    expect(CardPacks.access?.read).toBe(publishedOrAuthenticated);
    expect(typeof CardPacks.access?.create).toBe('function');
    expect(typeof CardPacks.access?.update).toBe('function');
    expect(typeof CardPacks.access?.delete).toBe('function');
  });

  it('has a localized name and description, a non-localized unique slug', () => {
    const name = byName(CardPacks.fields, 'name');
    const slug = byName(CardPacks.fields, 'slug');
    const description = byName(CardPacks.fields, 'description');
    expect(name).toMatchObject({ type: 'text', required: true, localized: true });
    expect(slug).toMatchObject({ type: 'text', required: true, unique: true });
    expect(slug?.localized).toBeFalsy();
    expect(description).toMatchObject({ type: 'textarea', localized: true });
  });

  it('has a cover image upload and a numeric version', () => {
    const coverImage = byName(CardPacks.fields, 'coverImage');
    const version = byName(CardPacks.fields, 'version');
    expect(coverImage).toMatchObject({ type: 'upload', relationTo: 'media' });
    expect(version).toMatchObject({ type: 'number', defaultValue: 1 });
  });

  it('exposes a nested GET /:id/cards endpoint', () => {
    const endpoints = Array.isArray(CardPacks.endpoints) ? CardPacks.endpoints : [];
    const endpoint = endpoints.find((e) => e.path === '/:id/cards' && e.method === 'get');
    expect(endpoint).toBeTruthy();
  });
});
