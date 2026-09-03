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

  // Optional analytics — the script renders only when both are set.
  PUBLIC_PLAUSIBLE_DOMAIN: z.preprocess(emptyToUndefined, z.string().optional()),
  PUBLIC_PLAUSIBLE_SRC: z.preprocess(emptyToUndefined, z.string().url().optional()),
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
