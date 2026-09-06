import { expect, test, type Page } from '@playwright/test';

const CMS_URL = process.env.E2E_CMS_URL ?? 'http://localhost:3000';
const VARIANTS = ['fade', 'slide-up', 'zoom', 'neon'] as const;

/** The keyframe the `<section>` itself runs for each variant (neon fades the
 *  section and runs hero-in-neon on the <h1>). */
const SECTION_KEYFRAME: Record<(typeof VARIANTS)[number], string> = {
  fade: 'hero-in-fade',
  'slide-up': 'hero-in-slide',
  zoom: 'hero-in-zoom',
  neon: 'hero-in-fade',
};

/** Drop a throwaway `.hero.hero--<v>` probe on the current page and read the
 *  computed animation the real stylesheet gives it. `durationVar` sets an inline
 *  `--hero-anim-duration` first (simulating what Hero.astro emits). */
async function probe(page: Page, variant: string, durationVar?: string) {
  return page.evaluate(
    ({ v, dur }) => {
      const section = document.createElement('section');
      section.className = `hero hero--${v}`;
      if (dur) section.style.setProperty('--hero-anim-duration', dur);
      const h1 = document.createElement('h1');
      section.append(h1);
      document.body.append(section);
      const s = getComputedStyle(section);
      const h = getComputedStyle(h1);
      const out = {
        name: s.animationName,
        fill: s.animationFillMode,
        duration: s.animationDuration,
        h1Name: h.animationName,
        h1Fill: h.animationFillMode,
        h1Duration: h.animationDuration,
      };
      section.remove();
      return out;
    },
    { v: variant, dur: durationVar ?? '' },
  );
}

test.describe('hero entrance animation', () => {
  test('the rendered <section> carries hero--<x> matching SiteSettings.heroAnimation', async ({
    page,
    request,
  }) => {
    const settings = await (
      await request.get(`${CMS_URL}/api/globals/site-settings?depth=0`)
    ).json();
    const expected = (VARIANTS as readonly string[]).includes(settings.heroAnimation)
      ? settings.heroAnimation
      : 'fade';

    await page.goto('/ru');
    const hero = page.locator('section.hero').first();
    await expect(hero).toHaveClass(new RegExp(`\\bhero--${expected}\\b`));
    // exactly one variant class on the element
    const cls = (await hero.getAttribute('class')) ?? '';
    expect(cls.match(/\bhero--[\w-]+/g)).toEqual([`hero--${expected}`]);
  });

  test('reduced-motion OFF: every variant runs a hero-in-* keyframe with fill-mode both', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/ru');

    for (const v of VARIANTS) {
      const r = await probe(page, v);
      expect(r.name, `${v} section animation-name`).toBe(SECTION_KEYFRAME[v]);
      expect(r.fill, `${v} section fill-mode`).toBe('both');
      if (v === 'neon') {
        expect(r.h1Name, 'neon <h1> animation-name').toBe('hero-in-neon');
        expect(r.h1Fill, 'neon <h1> fill-mode').toBe('both');
      }
    }
  });

  test('reduced-motion ON: no variant animates (spec gate)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ru');

    for (const v of VARIANTS) {
      const r = await probe(page, v);
      expect(r.name, `${v} section`).toBe('none');
      if (v === 'neon') expect(r.h1Name, 'neon <h1>').toBe('none');
    }
  });

  test('no layout shift: hero box is identical with and without the animation', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ru');
    const still = await page.locator('section.hero').first().boundingBox();

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/ru');
    await page.waitForTimeout(1200); // longest hero animation is 1.2s
    await page.waitForFunction(
      () =>
        !document
          .querySelector('section.hero')
          ?.getAnimations({ subtree: true })
          .some((a) => a.playState === 'running'),
    );
    const animated = await page.locator('section.hero').first().boundingBox();

    for (const k of ['x', 'y', 'width', 'height'] as const) {
      expect(Math.abs(animated![k] - still![k]), `hero ${k}`).toBeLessThanOrEqual(1);
    }
  });

  test('initial load carries no data-navigating flag (the animation is allowed to play)', async ({
    page,
  }) => {
    await page.goto('/ru');
    await expect(page.locator('html')).not.toHaveAttribute('data-navigating', /.*/);
  });

  test('AnimationSettings.duration drives Fade / Slide up / Zoom; default is 1.2s', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/ru');

    for (const v of ['fade', 'slide-up', 'zoom'] as const) {
      // explicit admin value flows through the custom property
      expect((await probe(page, v, '2.5s')).duration, `${v} with --hero-anim-duration:2.5s`).toBe(
        '2.5s',
      );
      // no custom property → the 1.2s CSS fallback
      expect((await probe(page, v)).duration, `${v} default`).toBe('1.2s');
    }
  });

  test('Neon duration is fixed and ignores --hero-anim-duration', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/ru');

    const r = await probe(page, 'neon', '4s');
    expect(r.duration, 'neon section').toBe('0.5s');
    expect(r.h1Duration, 'neon <h1>').toBe('1.2s');
  });

  test('the rendered hero <section> exposes --hero-anim-duration from AnimationSettings', async ({
    page,
    request,
  }) => {
    const res = await request.get(`${CMS_URL}/api/globals/animation-settings?depth=0`);
    const raw = res.ok() ? Number((await res.json()).duration) : NaN;
    const expected = Number.isFinite(raw) && raw >= 0.2 && raw <= 5 ? `${raw}s` : '1.2s';

    await page.goto('/ru');
    const varValue = await page
      .locator('section.hero')
      .first()
      .evaluate((el) => getComputedStyle(el).getPropertyValue('--hero-anim-duration').trim());

    expect(varValue).toBe(expected);
  });
});
