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

  // Transactional email (password reset, etc.). A nodemailer connection string,
  // e.g. smtps://user:pass@smtp.example.com:465. Without it Payload logs mail to
  // the console — fine for dev, refused in production unless EMAIL_OPTOUT=true.
  SMTP_URL: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@localhost'),
  EMAIL_FROM_NAME: z.string().default('treenweb'),
  EMAIL_OPTOUT: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
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
 * Fail-fast guards for production boot:
 *  - `PAYLOAD_DB_PUSH=true` auto-syncs the Postgres schema on boot — a dev-only
 *    convenience; prod must apply reviewed migrations.
 *  - no `SMTP_URL` means password-reset tokens get logged to the console;
 *    `EMAIL_OPTOUT=true` acknowledges that admin recovery is CLI-only.
 * Only fires when `NODE_ENV=production` — CI e2e runs the backend as
 * development, vitest as `test`.
 */
export function productionEnvProblems(
  values: Pick<Env, 'NODE_ENV' | 'PAYLOAD_DB_PUSH' | 'SMTP_URL' | 'EMAIL_OPTOUT'>,
): string[] {
  if (values.NODE_ENV !== 'production') return [];
  const problems: string[] = [];
  if (values.PAYLOAD_DB_PUSH) {
    problems.push(
      'PAYLOAD_DB_PUSH must be false in production — apply migrations, not schema push',
    );
  }
  if (!values.SMTP_URL && !values.EMAIL_OPTOUT) {
    problems.push(
      'SMTP_URL is not set — the admin password-reset flow would write reset tokens to the log. ' +
        'Set SMTP_URL, or EMAIL_OPTOUT=true to accept CLI-only admin recovery.',
    );
  }
  return problems;
}

const problems = productionEnvProblems(env);
if (problems.length > 0) {
  console.error(
    `\n✖ Invalid backend environment:\n${problems.map((p) => `  - ${p}`).join('\n')}\n`,
  );
  throw new Error('Invalid backend environment — see the errors above');
}
