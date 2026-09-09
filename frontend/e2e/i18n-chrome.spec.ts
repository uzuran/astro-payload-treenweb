import { expect, test } from '@playwright/test';

import { EXPECTED, LOCALES } from './_expected';

// The consent banner is a full-width bottom gate that covers the viewport edge
// and blocks clicks on anything near it. A real returning visitor has dismissed
// it; pre-seed the decision so feature tests aren't fighting it. The dedicated
// banner test clears cookies first, so it still renders there.
test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([
    { name: 'cookie_consent', value: 'essential', url: baseURL ?? 'http://localhost:4321' },
  ]);
});

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
    await page.evaluate(() => window.scrollTo(0, 10_000)); // clamps to max scroll
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('aria-label', /.+/);

    await btn.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
    await expect(btn).toBeHidden();
  });

  test(`[${locale}] privacy page + footer "manage consent" reopens the banner`, async ({
    page,
  }) => {
    const bannerByRole = () => page.getByRole('dialog', { name: /cookie|согласие|souhlas/i });

    // beforeEach seeded cookie_consent → no banner
    await page.goto(`/${locale}`);
    await expect(bannerByRole()).toHaveCount(0);

    // footer → privacy page
    const privacyLink = page.locator(`footer a[href="/${locale}/privacy"]`);
    await expect(privacyLink).toBeVisible();
    await privacyLink.click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/privacy$`));
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('');
    await expect(page.locator('dt', { hasText: 'cookie_consent' })).toBeVisible();

    // footer "manage consent" → withdraws consent → banner returns, same page
    await page.goto(`/${locale}`);
    await page.locator('footer [data-consent-reset] button').click();
    await expect(page).toHaveURL(new RegExp(`/${locale}$`));
    await expect(bannerByRole()).toBeVisible();
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

test('POST /booking validates input and honours the honeypot', async ({ request }) => {
  const good = {
    name: 'Tester',
    phone: '+420 123 456 789',
    service: 'Haircut',
    master: 'Any',
    date: '2999-01-02',
  };

  const ok = await request.post('/booking', { data: good });
  expect(ok.status()).toBe(200);
  expect((await ok.json()).ok).toBe(true);

  const bad = await request.post('/booking', { data: { ...good, phone: 'nope', date: 'x' } });
  expect(bad.status()).toBe(422);
  expect((await bad.json()).errors).toMatchObject({ phone: 'invalid', date: 'invalid' });

  // honeypot filled → accepted, but nothing is processed
  const bot = await request.post('/booking', { data: { ...good, company: 'Acme' } });
  expect(bot.status()).toBe(200);
});
