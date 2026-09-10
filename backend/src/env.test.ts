import { describe, expect, it } from 'vitest';

import { productionEnvProblems } from './env';

const prod = {
  NODE_ENV: 'production' as const,
  PAYLOAD_DB_PUSH: false,
  SMTP_URL: 'smtps://u:p@smtp.example.com:465',
  EMAIL_OPTOUT: false,
};

describe('productionEnvProblems', () => {
  it('is silent outside production whatever the values', () => {
    for (const NODE_ENV of ['development', 'test'] as const) {
      expect(
        productionEnvProblems({
          NODE_ENV,
          PAYLOAD_DB_PUSH: true,
          SMTP_URL: undefined,
          EMAIL_OPTOUT: false,
        }),
      ).toEqual([]);
    }
  });

  it('passes in production when push is off and email is configured', () => {
    expect(productionEnvProblems(prod)).toEqual([]);
  });

  it('flags PAYLOAD_DB_PUSH=true in production', () => {
    const problems = productionEnvProblems({ ...prod, PAYLOAD_DB_PUSH: true });
    expect(problems.some((p) => p.includes('PAYLOAD_DB_PUSH'))).toBe(true);
  });

  it('flags a missing SMTP_URL in production', () => {
    const problems = productionEnvProblems({ ...prod, SMTP_URL: undefined });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/SMTP_URL/);
  });

  it('accepts EMAIL_OPTOUT=true instead of SMTP_URL', () => {
    expect(productionEnvProblems({ ...prod, SMTP_URL: undefined, EMAIL_OPTOUT: true })).toEqual([]);
  });

  it('reports both problems together', () => {
    expect(
      productionEnvProblems({
        NODE_ENV: 'production',
        PAYLOAD_DB_PUSH: true,
        SMTP_URL: undefined,
        EMAIL_OPTOUT: false,
      }),
    ).toHaveLength(2);
  });
});
