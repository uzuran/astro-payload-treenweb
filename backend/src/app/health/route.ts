// Lightweight liveness probe used by Docker / compose healthchecks.
// It intentionally does NOT touch the database (that would run on every poll);
// a readiness endpoint can be added later if needed.
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ status: 'ok', service: 'backend' });
}
