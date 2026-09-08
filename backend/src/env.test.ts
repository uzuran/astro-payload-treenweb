import { describe, expect, it } from 'vitest';

import { productionEnvProblems } from './env';

describe('productionEnvProblems', () => {
  it('is silent outside production regardless of PAYLOAD_DB_PUSH', () => {
    for (const NODE_ENV of ['development', 'test'] as const) {
      expect(productionEnvProblems({ NODE_ENV, PAYLOAD_DB_PUSH: true })).toEqual([]);
      expect(productionEnvProblems({ NODE_ENV, PAYLOAD_DB_PUSH: false })).toEqual([]);
    }
  });

  it('passes in production when schema push is off', () => {
    expect(productionEnvProblems({ NODE_ENV: 'production', PAYLOAD_DB_PUSH: false })).toEqual([]);
  });

  it('flags PAYLOAD_DB_PUSH=true in production', () => {
    const problems = productionEnvProblems({ NODE_ENV: 'production', PAYLOAD_DB_PUSH: true });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/PAYLOAD_DB_PUSH/);
  });
});
