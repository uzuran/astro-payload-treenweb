import { z } from 'zod';

/** Comma-separated string -> trimmed non-empty string[] */
const csv = (fallback = '') =>
  z
    .string()
    .default(fallback)
    .transform((value) =>
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    );

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DATABASE_URL: z.string().url(),
  PAYLOAD_SECRET: z.string().min(32, 'PAYLOAD_SECRET must be at least 32 characters'),
  PAYLOAD_PUBLIC_SERVER_URL: z.string().url().default('http://localhost:3000'),

  // `true` only in local development; staging/prod use generated migrations.
  PAYLOAD_DB_PUSH: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),

  CORS_ORIGINS: csv('http://localhost:4321'),
  CSRF_ORIGINS: csv('http://localhost:4321,http://localhost:3000'),

  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().default('development'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  console.error(`\n✖ Invalid backend environment:\n${issues}\n`);
  throw new Error('Invalid backend environment — see the errors above');
}

export const env = parsed.data;
export type Env = typeof env;

/**
 * Fail-fast guard: `PAYLOAD_DB_PUSH=true` auto-syncs the Postgres schema from
 * the models on boot. That is a dev-only convenience — production must apply
 * reviewed migrations instead, or an unintended model edit silently rewrites
 * the live schema. (The CI e2e job sets it against a throwaway database and
 * never boots the backend with NODE_ENV=production; vitest runs as `test`.)
 */
export function productionEnvProblems(values: Pick<Env, 'NODE_ENV' | 'PAYLOAD_DB_PUSH'>): string[] {
  if (values.NODE_ENV !== 'production') return [];
  return values.PAYLOAD_DB_PUSH
    ? ['PAYLOAD_DB_PUSH must be false in production — apply migrations, not schema push']
    : [];
}

const problems = productionEnvProblems(env);
if (problems.length > 0) {
  console.error(
    `\n✖ Invalid backend environment:\n${problems.map((p) => `  - ${p}`).join('\n')}\n`,
  );
  throw new Error('Invalid backend environment — see the errors above');
}
