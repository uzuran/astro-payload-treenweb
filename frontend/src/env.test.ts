import { describe, expect, it } from 'vitest';

import { productionEnvProblems } from './env';

const REAL = {
  PUBLIC_SITE_URL: 'https://forma.example.com',
  PUBLIC_CMS_URL: 'https://cms.forma.example.com',
};

describe('productionEnvProblems', () => {
  it('is silent outside production even with localhost origins', () => {
    for (const NODE_ENV of ['development', 'test']) {
      expect(
        productionEnvProblems({
          NODE_ENV,
          PUBLIC_SITE_URL: 'http://localhost:4321',
          PUBLIC_CMS_URL: 'http://localhost:3000',
        }),
      ).toEqual([]);
    }
  });

  it('passes in production when both origins are real', () => {
    expect(productionEnvProblems({ NODE_ENV: 'production', ...REAL })).toEqual([]);
  });

  it('flags each localhost / loopback origin in production', () => {
    for (const bad of [
      'http://localhost:4321',
      'https://localhost',
      'http://127.0.0.1:3000',
      'http://127.0.0.1/',
      'http://[::1]:3000',
    ]) {
      const problems = productionEnvProblems({
        NODE_ENV: 'production',
        ...REAL,
        PUBLIC_SITE_URL: bad,
      });
      expect(problems, bad).toHaveLength(1);
      expect(problems[0], bad).toContain('PUBLIC_SITE_URL');
    }
  });

  it('reports both origins when both are localhost', () => {
    expect(
      productionEnvProblems({
        NODE_ENV: 'production',
        PUBLIC_SITE_URL: 'http://localhost:4321',
        PUBLIC_CMS_URL: 'http://localhost:3000',
      }),
    ).toHaveLength(2);
  });

  it('does not confuse a real host that merely contains "localhost"', () => {
    expect(
      productionEnvProblems({
        NODE_ENV: 'production',
        ...REAL,
        PUBLIC_CMS_URL: 'https://localhost.forma.example.com',
      }),
    ).toEqual([]);
  });
});
