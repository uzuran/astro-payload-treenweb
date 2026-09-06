import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:4321';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Assumes a running stack (Astro SSR + Payload). `E2E_NO_SERVER=1` skips auto-start
  // and runs against whatever is already serving `baseURL` (e.g. `make dev`).
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : {
        command: 'pnpm --filter @treenweb/frontend preview',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
