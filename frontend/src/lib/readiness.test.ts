import { afterEach, describe, expect, it, vi } from 'vitest';

import { checkReadiness } from './readiness';

const BASE = 'http://cms.internal:3000';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('checkReadiness', () => {
  it('is ready when the CMS global fetch returns 2xx', async () => {
    const fetchMock = vi.fn(async (_url: string | URL) => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await checkReadiness(BASE);

    expect(result).toMatchObject({ httpStatus: 200, status: 'ready', cms: 200 });
    expect(typeof result.ms).toBe('number');
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(`${BASE}/api/globals/site-settings?depth=0`);
  });

  it('is unavailable (503) when the CMS answers non-2xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 500 })),
    );
    expect(await checkReadiness(BASE)).toMatchObject({
      httpStatus: 503,
      status: 'unavailable',
      cms: 500,
    });
  });

  it('reports "unreachable" when the connection fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );
    expect(await checkReadiness(BASE)).toMatchObject({
      httpStatus: 503,
      status: 'unavailable',
      cms: 'unreachable',
    });
  });

  it('reports "timeout" when the request is aborted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string | URL, init?: RequestInit) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const err = new Error('aborted');
        err.name = 'AbortError';
        if (init?.signal?.aborted) throw err;
        throw err;
      }),
    );
    expect(await checkReadiness(BASE, 5)).toMatchObject({
      httpStatus: 503,
      status: 'unavailable',
      cms: 'timeout',
    });
  });
});
