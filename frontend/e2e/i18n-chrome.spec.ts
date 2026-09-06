import { expect, test } from '@playwright/test';

import { EXPECTED, LOCALES } from './_expected';

for (const locale of LOCALES) {
  const e = EXPECTED[locale];

  test(`[${locale}] header + footer + booking chrome comes from ui-labels`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);

    await expect(
      page.getByRole('banner').getByRole('link', { name: new RegExp(e.cta) }),
    ).toBeVisible();

    await expect(page.getByText(e.findUs, { exact: true })).toBeVisible();

    const form = page.locator('#booking-form');
    await expect(form.getByRole('button', { name: new RegExp(e.submit) })).toBeVisible();
  });

  test(`[${locale}] cookie-consent banner text comes from ui-labels`, async ({ page }) => {
    await page.context().clearCookies(); // ensure the banner renders
    await page.goto(`/${locale}`);

    const banner = page.getByRole('dialog', { name: /cookie|согласие|souhlas/i });
    await expect(banner).toBeVisible();
    await expect(banner.getByRole('button', { name: e.consentEssential })).toBeVisible();
    await expect(banner.getByRole('button', { name: e.consentAnalytics })).toBeVisible();

    // choosing "essential" dismisses it and it stays dismissed on reload
    await banner.getByRole('button', { name: e.consentEssential }).click();
    await expect(banner).toBeHidden();
    await page.reload();
    await expect(page.getByRole('dialog', { name: /cookie|согласие|souhlas/i })).toHaveCount(0);
  });

  test(`[${locale}] footer secondary nav renders locale-prefixed links`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const footerNav = page.locator('footer nav');
    await expect(footerNav).toHaveCount(1);

    const first = footerNav.getByRole('link').first();
    await expect(first).toBeVisible();
    expect(await first.getAttribute('href')).toMatch(new RegExp(`^/${locale}#`));
  });

  test(`[${locale}] footer renders social icon links from SiteSettings.social`, async ({
    page,
  }) => {
    await page.goto(`/${locale}`);

    const links = page.locator('footer ul a[target="_blank"]');
    await expect(links.first()).toBeVisible();
    expect(await links.count()).toBeGreaterThanOrEqual(5);

    const first = links.first();
    expect(await first.getAttribute('rel')).toContain('noopener');
    await expect(first).toHaveAttribute('aria-label', /.+/);
    await expect(first.locator('svg path')).toHaveCount(1);
  });

  test(`[${locale}] back-to-top button appears on scroll and returns to the top`, async ({
    page,
  }) => {
    await page.goto(`/${locale}`);
    const btn = page.locator('#back-to-top');

    await expect(btn).toBeHidden(); // hidden at the top of the page
    await page.evaluate(() => window.scrollTo(0, 2000));
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('aria-label', /.+/);

    await btn.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
    await expect(btn).toBeHidden();
  });

  test(`[${locale}] booking confirmation interpolates, no raw tokens`, async ({ page }) => {
    await page.goto(`/${locale}#booking`);
    const form = page.locator('#booking-form');
    await form.locator('input[name="name"]').fill('Tester');
    await form.locator('input[name="phone"]').fill('+420 123 456 789');

    const service = form.locator('select[name="service"]');
    const chosen = (await service.locator('option').first().textContent())?.trim() ?? '';
    await service.selectOption({ index: 0 });

    await form.locator('input[name="date"]').fill('2030-06-15');
    await form.getByRole('button', { name: new RegExp(e.submit) }).click();

    const result = page.locator('#form-result');
    await expect(result).not.toHaveText('');
    await expect(result).not.toHaveText(/\{name\}|\{service\}|\{date\}/);
    await expect(result).toContainText('Tester');
    if (chosen) await expect(result).toContainText(chosen);
    await expect(result).toContainText('15.06.2030');
  });

  test(`[${locale}] missing content page → 404 + localized copy`, async ({ page }) => {
    const res = await page.goto(`/${locale}/__does-not-exist__`);
    expect(res?.status()).toBe(404);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(e.notFound);
    await expect(page.locator('p.muted code')).toHaveText('/__does-not-exist__');
    await expect(page.getByRole('link', { name: e.back })).toHaveAttribute('href', `/${locale}`);
  });

  test(`[${locale}] standalone /404 route uses the localized 404 heading + body`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/404`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(e.notFound404);
    await expect(page.locator('main p.muted')).not.toHaveText('');
  });
}
