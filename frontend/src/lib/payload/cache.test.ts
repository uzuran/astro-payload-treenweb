import { afterEach, describe, expect, it, vi } from 'vitest';

import { _clearCmsCache, cached } from './cache';

afterEach(() => {
  _clearCmsCache();
  vi.useRealTimers();
});

describe('cached', () => {
  it('bypasses entirely when ttl <= 0 (calls load every time)', async () => {
    const load = vi.fn(async () => 'x');
    await cached('k', 0, load);
    await cached('k', 0, load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('serves a fresh entry without calling load again', async () => {
    const load = vi.fn(async () => ({ n: 1 }));
    const a = await cached('k', 1000, load);
    const b = await cached('k', 1000, load);
    expect(load).toHaveBeenCalledTimes(1);
    expect(b).toBe(a);
  });

  it('reloads once the entry has expired', async () => {
    vi.useFakeTimers();
    let n = 0;
    const load = vi.fn(async () => ++n);

    expect(await cached('k', 1000, load)).toBe(1);
    vi.advanceTimersByTime(1001);
    expect(await cached('k', 1000, load)).toBe(2);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('dedupes concurrent misses into a single load', async () => {
    const load = vi.fn(() => new Promise((resolve) => setTimeout(() => resolve('v'), 10)));
    const [a, b] = await Promise.all([cached('k', 1000, load), cached('k', 1000, load)]);
    expect(load).toHaveBeenCalledTimes(1);
    expect(a).toBe('v');
    expect(b).toBe('v');
  });

  it('never caches a rejection', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce('ok');

    await expect(cached('k', 1000, load)).rejects.toThrow('boom');
    expect(await cached('k', 1000, load)).toBe('ok');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('keys are independent', async () => {
    const load = vi.fn(async (v: string) => v);
    expect(await cached('a', 1000, () => load('a'))).toBe('a');
    expect(await cached('b', 1000, () => load('b'))).toBe('b');
    expect(load).toHaveBeenCalledTimes(2);
  });
});
