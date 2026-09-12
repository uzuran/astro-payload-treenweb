import type { Payload } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

let payload: Payload;

// 1x1 transparent PNG — just enough to satisfy Cards.image's required upload.
const TEST_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

beforeAll(async () => {
  const { getPayload } = await import('payload');
  const { default: config } = await import('../src/payload.config');
  payload = await getPayload({ config });
});

afterAll(async () => {
  await payload?.db?.destroy?.();
});

describe('CardPacks access control (read: publishedOrAuthenticated)', () => {
  it('lets an anonymous request read a published pack', async () => {
    const pack = await payload.create({
      collection: 'card-packs',
      data: {
        name: 'Classic Tarot',
        slug: `classic-${Date.now()}`,
        version: 1,
        _status: 'published',
      },
      overrideAccess: true,
    });

    const found = await payload.findByID({
      collection: 'card-packs',
      id: pack.id,
      overrideAccess: false,
    });
    expect(found.id).toBe(pack.id);
  });

  it('blocks an anonymous request from reading a draft pack', async () => {
    const pack = await payload.create({
      collection: 'card-packs',
      data: { name: 'Unreleased Pack', slug: `draft-${Date.now()}`, version: 1, _status: 'draft' },
      overrideAccess: true,
    });

    await expect(
      payload.findByID({ collection: 'card-packs', id: pack.id, overrideAccess: false }),
    ).rejects.toThrow();
  });
});

describe('Cards', () => {
  it('links to its pack and returns locale-appropriate content when filtered by pack', async () => {
    const media = await payload.create({
      collection: 'media',
      data: { alt: 'test card art' },
      file: { data: TEST_PNG, mimetype: 'image/png', name: 'test-card.png', size: TEST_PNG.length },
      overrideAccess: true,
    });

    const pack = await payload.create({
      collection: 'card-packs',
      data: { name: 'Oracle Deck', slug: `oracle-${Date.now()}`, version: 1, _status: 'published' },
      overrideAccess: true,
    });

    const card = await payload.create({
      collection: 'cards',
      data: {
        pack: pack.id,
        image: media.id,
        name: 'The Sun',
        meaningUpright: 'Joy',
        order: 1,
        _status: 'published',
      },
      locale: 'en',
      overrideAccess: true,
    });
    await payload.update({
      collection: 'cards',
      id: card.id,
      data: { name: 'Slunce', meaningUpright: 'Radost' },
      locale: 'cs',
      overrideAccess: true,
    });

    const enResult = await payload.find({
      collection: 'cards',
      where: { pack: { equals: pack.id } },
      locale: 'en',
      overrideAccess: false,
    });
    expect(enResult.totalDocs).toBe(1);
    expect(enResult.docs[0]?.name).toBe('The Sun');

    const csResult = await payload.find({
      collection: 'cards',
      where: { pack: { equals: pack.id } },
      locale: 'cs',
      overrideAccess: false,
    });
    expect(csResult.docs[0]?.name).toBe('Slunce');
  });

  it('a draft card is invisible to an anonymous read even when its pack is published', async () => {
    const media = await payload.create({
      collection: 'media',
      data: { alt: 'test card art' },
      file: {
        data: TEST_PNG,
        mimetype: 'image/png',
        name: 'test-card-2.png',
        size: TEST_PNG.length,
      },
      overrideAccess: true,
    });
    const pack = await payload.create({
      collection: 'card-packs',
      data: {
        name: 'Pack With A Draft Card',
        slug: `mixed-${Date.now()}`,
        version: 1,
        _status: 'published',
      },
      overrideAccess: true,
    });
    await payload.create({
      collection: 'cards',
      data: { pack: pack.id, image: media.id, name: 'Hidden Card', order: 1, _status: 'draft' },
      overrideAccess: true,
    });

    const result = await payload.find({
      collection: 'cards',
      where: { pack: { equals: pack.id } },
      overrideAccess: false,
    });
    expect(result.totalDocs).toBe(0);
  });
});
