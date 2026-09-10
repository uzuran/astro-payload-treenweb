import { describe, expect, it, vi } from 'vitest';

import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { emailAdapter } from './email';

vi.mock('@payloadcms/email-nodemailer', () => ({
  nodemailerAdapter: vi.fn(() => 'ADAPTER'),
}));

const from = { EMAIL_FROM: 'from@forma.example', EMAIL_FROM_NAME: 'FORMA' };

describe('emailAdapter', () => {
  it('returns undefined without SMTP_URL (Payload falls back to the console adapter)', () => {
    expect(emailAdapter({ SMTP_URL: undefined, ...from })).toBeUndefined();
    expect(nodemailerAdapter).not.toHaveBeenCalled();
  });

  it('builds a nodemailer adapter from SMTP_URL + the from-identity', () => {
    const out = emailAdapter({ SMTP_URL: 'smtps://u:p@smtp.example.com:465', ...from });
    expect(out).toBe('ADAPTER');
    expect(nodemailerAdapter).toHaveBeenCalledWith({
      defaultFromAddress: 'from@forma.example',
      defaultFromName: 'FORMA',
      transportOptions: 'smtps://u:p@smtp.example.com:465',
    });
  });
});
