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

describe('SiteSettings access control (read: anyone, update: authenticated)', () => {
  it('lets an anonymous request read the global', async () => {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      overrideAccess: false,
    });
    expect(settings.siteName).toBeTruthy();
  });

  it('blocks an anonymous request from updating the global', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: { siteName: 'hijacked-by-anon' },
        overrideAccess: false,
      }),
    ).rejects.toThrow();
  });

  it('lets a privileged (authenticated-equivalent) request update the global', async () => {
    const updated = await payload.updateGlobal({
      slug: 'site-settings',
      data: { siteName: 'updated-by-admin' },
      overrideAccess: true,
    });
    expect(updated.siteName).toBe('updated-by-admin');
  });
});
