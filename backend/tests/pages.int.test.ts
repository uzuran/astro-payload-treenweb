import type { Payload } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

let payload: Payload;

beforeAll(async () => {
  const { getPayload } = await import('payload');
  const { default: config } = await import('../src/payload.config');
  payload = await getPayload({ config });
});

afterAll(async () => {
  await payload?.db?.destroy?.();
});

describe('Pages access control', () => {
  it('hides drafts from anonymous reads but shows them with access override', async () => {
    const unique = `int-${Date.now()}`;

    const draft = await payload.create({
      collection: 'pages',
      data: { title: unique, slug: unique, _status: 'draft' },
    });

    const anon = await payload.find({
      collection: 'pages',
      where: { id: { equals: draft.id } },
      overrideAccess: false,
    });
    expect(anon.totalDocs).toBe(0);

    const authed = await payload.find({
      collection: 'pages',
      where: { id: { equals: draft.id } },
      overrideAccess: true,
    });
    expect(authed.totalDocs).toBe(1);

    await payload.delete({ collection: 'pages', id: draft.id });
  });

  it('derives a slug from the title when none is given', async () => {
    const created = await payload.create({
      collection: 'pages',
      draft: false,
      // slug left blank on purpose — the beforeValidate hook derives it
      data: { title: 'Hello World Slug Test', slug: '', _status: 'published' },
    });
    expect(created.slug).toBe('hello-world-slug-test');
    await payload.delete({ collection: 'pages', id: created.id });
  });
});
