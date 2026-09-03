import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.int.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 180_000,
    pool: 'forks',
    // Integration tests hit a throwaway database (schema is `push`-synced).
    // Unit tests ignore these.
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.DATABASE_URL_TEST ??
        'postgres://treenweb:treenweb@localhost:5432/treenweb_test',
      PAYLOAD_SECRET:
        process.env.PAYLOAD_SECRET ?? 'test-secret-test-secret-test-secret-0123456789',
      PAYLOAD_DB_PUSH: 'true',
    },
  },
});
