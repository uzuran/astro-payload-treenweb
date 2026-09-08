import { describe, expect, it } from 'vitest';

import { productionEnvProblems } from './env';

const REAL = {
  PUBLIC_SITE_URL: 'https://forma.example.com',
  PUBLIC_CMS_URL: 'https://cms.forma.example.com',
};

describe('productionEnvProblems', () => {
  it('is silent outside production, even with nothing provided', () => {
    for (const nodeEnv of ['development', 'test']) {
      expect(productionEnvProblems(nodeEnv, {})).toEqual([]);
    }
  });

  it('passes in production when both origins are provided — any value', () => {
    expect(productionEnvProblems('production', REAL)).toEqual([]);
    // a production build served locally on purpose (CI e2e / astro preview)
    expect(
      productionEnvProblems('production', {
        PUBLIC_SITE_URL: 'http://localhost:4321',
        PUBLIC_CMS_URL: 'http://localhost:3000',
      }),
    ).toEqual([]);
  });

  it('flags an origin that is missing or blank in production', () => {
    expect(productionEnvProblems('production', { PUBLIC_CMS_URL: REAL.PUBLIC_CMS_URL })).toEqual([
      'PUBLIC_SITE_URL is not set — it must be the real public origin in production',
    ]);
    expect(productionEnvProblems('production', { ...REAL, PUBLIC_SITE_URL: '   ' })).toHaveLength(
      1,
    );
    expect(
      productionEnvProblems('production', { ...REAL, PUBLIC_CMS_URL: undefined }),
    ).toHaveLength(1);
  });

  it('reports both origins when neither is provided in production', () => {
    expect(productionEnvProblems('production', {})).toHaveLength(2);
  });
});
