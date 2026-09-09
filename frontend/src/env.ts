import { z } from 'zod';

/**
 * Server-side environment for the Astro SSR runtime. Import only from server
 * code (loaders, endpoints, middleware) — never from client components.
 * Step 6 moves the schema into @treenweb/schemas.
 */
/** Treat an unset OR empty env var as "not provided". */
const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Browser-visible origin of this site. Drives canonical URLs + sitemap.
  PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default('http://localhost:4321'),
  ),

  // Server-only: internal URL used for SSR data fetching. In the compose
  // network this is the service name; on the host it is localhost.
  PAYLOAD_INTERNAL_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default('http://localhost:3000'),
  ),

  // Browser-visible CMS origin. Used server-side to turn Payload's relative
  // media URLs into absolute URLs the browser can load (Payload leaves
  // `serverURL` unset in dev). In compose this is the published localhost
  // port, not the internal service name; in prod it is the public CMS domain.
  PUBLIC_CMS_URL: z.preprocess(emptyToUndefined, z.string().url().default('http://localhost:3000')),

  // Optional analytics — the script renders only when both are set.
  PUBLIC_PLAUSIBLE_DOMAIN: z.preprocess(emptyToUndefined, z.string().optional()),
  PUBLIC_PLAUSIBLE_SRC: z.preprocess(emptyToUndefined, z.string().url().optional()),

  // In-process TTL (seconds) for CMS reads during SSR. 0 disables the cache
  // (dev default; CI e2e sets 0 for determinism). Prod sets e.g. 15–30.
  CMS_CACHE_TTL_S: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(0).max(3600).default(0),
  ),

  // Server-side error tracking. Sentry stays a no-op unless SENTRY_DSN is set
  // AND NODE_ENV is production (browser-side capture would use
  // PUBLIC_SENTRY_DSN — not wired yet).
  SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().optional()),
  SENTRY_ENVIRONMENT: z.preprocess(emptyToUndefined, z.string().default('development')),
  SENTRY_TRACES_SAMPLE_RATE: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0).max(1).default(0),
  ),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  console.error(`\n✖ Invalid frontend environment:\n${issues}\n`);
  throw new Error('Invalid frontend environment — see the errors above');
}

export const env = parsed.data;
export type Env = typeof env;

const PUBLIC_ORIGIN_KEYS = ['PUBLIC_SITE_URL', 'PUBLIC_CMS_URL'] as const;
type PublicOriginKey = (typeof PUBLIC_ORIGIN_KEYS)[number];

/**
 * Fail-fast guard: in production the browser-visible origins must be *explicitly
 * set*. A deploy that omits them would otherwise boot on the localhost defaults
 * and silently ship broken canonical URLs, hreflang, the sitemap and CMS media
 * links. A production build served locally on purpose (CI e2e, `astro preview`,
 * a smoke test) sets them — even to localhost — and is fine. Only presence is
 * checked, not the value. `PAYLOAD_INTERNAL_URL` is excluded: it is
 * server-internal and `localhost` is a legitimate value there.
 */
export function productionEnvProblems(
  nodeEnv: string,
  provided: Partial<Record<PublicOriginKey, string | undefined>>,
): string[] {
  if (nodeEnv !== 'production') return [];
  return PUBLIC_ORIGIN_KEYS.filter((key) => (provided[key] ?? '').trim() === '').map(
    (key) => `${key} is not set — it must be the real public origin in production`,
  );
}

const problems = productionEnvProblems(env.NODE_ENV, {
  PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL,
  PUBLIC_CMS_URL: process.env.PUBLIC_CMS_URL,
});
if (problems.length > 0) {
  console.error(
    `\n✖ Invalid frontend environment:\n${problems.map((p) => `  - ${p}`).join('\n')}\n`,
  );
  throw new Error('Invalid frontend environment — see the errors above');
}
