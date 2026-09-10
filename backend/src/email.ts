import { nodemailerAdapter } from '@payloadcms/email-nodemailer';

import { env } from './env';

type EmailAdapterArg = ReturnType<typeof nodemailerAdapter>;

/**
 * Transactional email for the CMS (password reset, verification, …).
 *
 * With `SMTP_URL` set → a real nodemailer SMTP transport. Without it → Payload's
 * built-in console adapter (fine for dev; `productionEnvProblems` in env.ts
 * refuses to boot prod that way unless `EMAIL_OPTOUT=true`).
 */
export function emailAdapter(
  e: Pick<typeof env, 'SMTP_URL' | 'EMAIL_FROM' | 'EMAIL_FROM_NAME'> = env,
): EmailAdapterArg | undefined {
  if (!e.SMTP_URL) return undefined;
  return nodemailerAdapter({
    defaultFromAddress: e.EMAIL_FROM,
    defaultFromName: e.EMAIL_FROM_NAME,
    transportOptions: e.SMTP_URL,
  });
}
