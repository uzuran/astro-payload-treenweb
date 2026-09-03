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
