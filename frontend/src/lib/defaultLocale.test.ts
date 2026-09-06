import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveDefaultLocale } from './defaultLocale';
import { DEFAULT_LOCALE } from './locale';

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('resolveDefaultLocale', () => {
  it('uses the locale set in SiteSettings', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ defaultLocale: 'en' })),
    );
    expect(await resolveDefaultLocale()).toBe('en');
  });

  it('falls back to DEFAULT_LOCALE when the stored code is unroutable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ defaultLocale: 'de' })),
    );
    expect(await resolveDefaultLocale()).toBe(DEFAULT_LOCALE);
  });

  it('falls back to DEFAULT_LOCALE when SiteSettings has no value', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({})),
    );
    expect(await resolveDefaultLocale()).toBe(DEFAULT_LOCALE);
  });

  it('falls back to DEFAULT_LOCALE when the CMS is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNREFUSED');
      }),
    );
    expect(await resolveDefaultLocale()).toBe(DEFAULT_LOCALE);
  });

  it('falls back to DEFAULT_LOCALE on a non-2xx CMS response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({}, { status: 503 })),
    );
    expect(await resolveDefaultLocale()).toBe(DEFAULT_LOCALE);
  });

  it('constrains the stored default to the enabled locales', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          defaultLocale: 'en',
          supportedLocales: [
            { code: 'ru', label: 'Русский', enabled: true },
            { code: 'cs', label: 'Čeština', enabled: true },
          ],
        }),
      ),
    );
    expect(await resolveDefaultLocale()).toBe('ru');
  });

  it('skips a disabled locale even when it is the stored default', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          defaultLocale: 'en',
          supportedLocales: [
            { code: 'en', label: 'English', enabled: false },
            { code: 'ru', label: 'Русский', enabled: true },
          ],
        }),
      ),
    );
    expect(await resolveDefaultLocale()).toBe('ru');
  });
});
