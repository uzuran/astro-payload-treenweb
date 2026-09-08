import type { APIRoute } from 'astro';

import { env } from '../env';
import { checkReadiness } from '../lib/readiness';

export const prerender = false;

/**
 * Readiness probe — verifies this process can reach Payload and Payload can
 * read Postgres. Returns 503 (not 200) when the chain is down so an
 * orchestrator can pull the instance from rotation. Liveness is `/healthz`.
 */
export const GET: APIRoute = async () => {
  const result = await checkReadiness(env.PAYLOAD_INTERNAL_URL);
  return new Response(JSON.stringify({ service: 'frontend', ...result }), {
    status: result.httpStatus,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
};
