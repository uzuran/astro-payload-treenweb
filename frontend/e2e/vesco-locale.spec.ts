import { expect, test } from '@playwright/test';

// Vesco is the current homepage. The URL carries the language: /en and /cs
// are static routes; prefix-less URLs (/, /tarot, ...) redirect to whichever
// language SiteSettings.defaultLocale resolves to (falling back to /en — see
// resolveVescoDefaultLocale in src/lib/vescoContent.ts).

test('/ redirects to /en on a fresh install (SiteSettings.defaultLocale defaults to ru, which Vesco has no route for)', async ({
  request,
}) => {
  const res = await request.get('/', { maxRedirects: 0 });
  expect(res.status()).toBe(302);
  expect(res.headers()['location']).toBe('/en');
  expect(res.headers()['cache-control']).toContain('no-store');
});

test('an old flat route (/tarot) redirects to its /en equivalent', async ({ request }) => {
  const res = await request.get('/tarot', { maxRedirects: 0 });
  expect(res.status()).toBe(302);
  expect(res.headers()['location']).toBe('/en/tarot');
});

test('/en renders in English, /cs renders in Czech', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('link', { name: 'VESCO' })).toBeVisible();

  await page.goto('/cs');
  await expect(page.locator('html')).toHaveAttribute('lang', 'cs');
});

test('the EN/CS toggle cross-links to the same page in the other locale', async ({ page }) => {
  await page.goto('/en/tarot');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  const csLink = page.locator('.v-toggle a[href="/cs/tarot"]');
  await expect(csLink).toBeVisible();
  await csLink.click();

  await expect(page).toHaveURL(/\/cs\/tarot$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'cs');
});

test('the /ru CMS-skeleton route is untouched by the Vesco takeover of /en and /cs', async ({
  page,
}) => {
  const res = await page.goto('/ru');
  expect(res?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
});
