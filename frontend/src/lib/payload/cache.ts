/**
 * Tiny in-process TTL cache for SSR CMS reads. The `@astrojs/node` standalone
 * server is one long-lived process, so a module-level Map survives between
 * requests. Only successful reads are cached; concurrent misses for the same
 * key share one in-flight request.
 *
 * Everything cached here is an idempotent GET (`/api/globals/*`, `/api/pages`,
 * …). Liveness/readiness probes bypass this and hit Payload directly.
 */
const MAX_ENTRIES = 200;

interface Entry {
  /** Resolves to the loaded value; kept so concurrent callers dedupe. */
  promise: Promise<unknown>;
  /** Epoch ms after which the entry is stale. */
  expires: number;
}

const store = new Map<string, Entry>();

/** Test seam. */
export function _clearCmsCache(): void {
  store.clear();
}

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  if (ttlMs <= 0) return load();

  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.promise as Promise<T>;

  const promise = load();
  store.set(key, { promise, expires: now + ttlMs });

  // Never cache a failure — drop the entry so the next call retries.
  promise.catch(() => {
    if (store.get(key)?.promise === promise) store.delete(key);
  });

  if (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }

  return promise;
}
