const DEFAULT_TIMEOUT_MS = 4_000;

export interface ReadinessResult {
  /** 200 when the serving chain is up, 503 otherwise. */
  httpStatus: 200 | 503;
  status: 'ready' | 'unavailable';
  /** Upstream HTTP status, or why the call never completed. */
  cms: number | 'timeout' | 'unreachable';
  ms: number;
}

/**
 * Readiness check for the frontend: fetch a Payload global. A 2xx proves this
 * process can reach the CMS **and** the CMS can read Postgres (loading a global
 * touches the DB), so one probe covers the whole serving chain. Liveness stays
 * at `/healthz`; an orchestrator should gate traffic on readiness.
 */
export async function checkReadiness(
  cmsBaseUrl: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<ReadinessResult> {
  const url = new URL('/api/globals/site-settings?depth=0', cmsBaseUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    const ok = res.ok;
    return {
      httpStatus: ok ? 200 : 503,
      status: ok ? 'ready' : 'unavailable',
      cms: res.status,
      ms: Date.now() - started,
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    return {
      httpStatus: 503,
      status: 'unavailable',
      cms: aborted ? 'timeout' : 'unreachable',
      ms: Date.now() - started,
    };
  } finally {
    clearTimeout(timer);
  }
}
