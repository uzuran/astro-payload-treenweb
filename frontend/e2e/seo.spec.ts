import { expect, test } from '@playwright/test';

import { ADMIN_DEFAULT, LOCALES } from './_expected';

for (const locale of LOCALES) {
  test(`[${locale}] title uses SiteSettings.seo.titleTemplate`, async ({ page }) => {
    await page.goto(`/${locale}`);
    // seeded template is "{page} · {site}" → ends with " · FORMA"
    await expect(page).toHaveTitle(/·\s*FORMA$/);
  });

  test(`[${locale}] hreflang set: one per enabled locale + x-default → admin default`, async ({
    page,
  }) => {
    await page.goto(`/${locale}`);
    const links = page.locator('link[rel="alternate"][hreflang]');
    expect(await links.count()).toBeGreaterThanOrEqual(LOCALES.length + 1);

    const xDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');
    await expect(xDefault).toHaveCount(1);
    expect(await xDefault.getAttribute('href')).toMatch(new RegExp(`/${ADMIN_DEFAULT}$`));
  });

  test(`[${locale}] home has a description; standalone /404 omits it`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const home = page.locator('head meta[name="description"]');
    await expect(home).toHaveCount(1);
    expect(((await home.getAttribute('content')) ?? '').length).toBeGreaterThan(0);

    await page.goto(`/${locale}/404`);
    await expect(page.locator('head meta[name="description"]')).toHaveCount(0);
  });
}
