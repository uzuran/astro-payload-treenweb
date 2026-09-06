import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const css = readFileSync(fileURLToPath(new URL('./global.css', import.meta.url)), 'utf8');

/** The `{ … }` body whose opening brace is the first `{` at/after `fromIdx`. */
function blockAt(source: string, fromIdx: number): string {
  const start = source.indexOf('{', fromIdx);
  let depth = 0;
  for (let i = start; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}' && --depth === 0) return source.slice(start + 1, i);
  }
  throw new Error('unbalanced braces');
}

const heroCommentIdx = css.indexOf('/* Hero entrance');
const noPrefMediaIdx = css.indexOf(
  '@media (prefers-reduced-motion: no-preference)',
  heroCommentIdx,
);
const heroMediaBody = blockAt(css, noPrefMediaIdx);

const VARIANTS = ['fade', 'slide-up', 'zoom', 'neon'] as const;
const KEYFRAMES = ['hero-in-fade', 'hero-in-slide', 'hero-in-zoom', 'hero-in-neon'] as const;
const ANIMATABLE_WITHOUT_LAYOUT_SHIFT = new Set(['opacity', 'transform', 'text-shadow']);

function keyframeBody(name: string): string {
  const idx = css.indexOf(`@keyframes ${name}`);
  expect(idx, `@keyframes ${name} exists`).toBeGreaterThan(-1);
  return blockAt(css, idx);
}

function keyframeProps(name: string): string[] {
  const props: string[] = [];
  for (const step of keyframeBody(name).matchAll(/\{([\s\S]*?)\}/g)) {
    for (const decl of step[1]!.split(';')) {
      const key = decl.split(':')[0]?.trim().toLowerCase();
      if (key) props.push(key);
    }
  }
  return props;
}

describe('hero entrance animation — CSS contract', () => {
  it('gates every .hero--* rule behind @media (prefers-reduced-motion: no-preference)', () => {
    for (const v of VARIANTS) {
      const inMedia = (heroMediaBody.match(new RegExp(`\\.hero--${v}\\b`, 'g')) || []).length;
      const inFile = (css.match(new RegExp(`\\.hero--${v}\\b`, 'g')) || []).length;
      expect(inMedia, `.hero--${v} used inside the media block`).toBeGreaterThanOrEqual(2);
      // every occurrence in the whole file is inside the reduced-motion-safe block
      expect(inFile, `.hero--${v} only appears inside the media block`).toBe(inMedia);
    }
  });

  it('runs each variant with animation-fill-mode: both (no pre-paint flash)', () => {
    const animateRules = [
      ...heroMediaBody.matchAll(/\.hero--[\w-]+(?:\s+h1)?\s*\{\s*animation:\s*([^;]+);/g),
    ]
      .map(([, sh]) => sh!.trim())
      .filter((sh) => /\bhero-in-\w+/.test(sh)); // exclude the `animation: none` guard

    // 4 section variants + `.hero--neon h1`
    expect(animateRules.length).toBe(5);
    for (const sh of animateRules) {
      expect(sh, `${sh} sets fill-mode both`).toMatch(/\bboth\s*$/);
      expect(sh, `${sh} names a hero-in-* keyframe`).toMatch(/\bhero-in-\w+/);
    }
  });

  it('animates the neon headline itself via `.hero--neon h1`', () => {
    expect(heroMediaBody).toMatch(/\.hero--neon\s+h1\s*\{\s*animation:\s*hero-in-neon\b/);
  });

  it('Fade / Slide up / Zoom take their duration from --hero-anim-duration (default 1.2s)', () => {
    for (const v of ['fade', 'slide-up', 'zoom'] as const) {
      const rule = heroMediaBody.match(
        new RegExp(`\\.hero--${v}\\s*\\{\\s*animation:\\s*([^;]+);`),
      )?.[1];
      expect(rule, `.hero--${v} animation shorthand`).toMatch(
        /var\(\s*--hero-anim-duration\s*,\s*1\.2s\s*\)/,
      );
    }
  });

  it('Neon keeps its own fixed timing (never reads --hero-anim-duration)', () => {
    const section = heroMediaBody.match(/\.hero--neon\s*\{\s*animation:\s*([^;]+);/)?.[1];
    const h1 = heroMediaBody.match(/\.hero--neon\s+h1\s*\{\s*animation:\s*([^;]+);/)?.[1];
    expect(section, 'neon section').toContain('hero-in-fade 0.5s');
    expect(section).not.toContain('--hero-anim-duration');
    expect(h1, 'neon <h1>').toContain('hero-in-neon 1.2s');
    expect(h1).not.toContain('--hero-anim-duration');
  });

  it('suppresses the animation during a client-side navigation (data-navigating guard)', () => {
    const guard = heroMediaBody.slice(heroMediaBody.indexOf('[data-navigating]'));
    for (const v of VARIANTS) {
      expect(guard, `guard covers .hero--${v}`).toContain(`.hero--${v}`);
    }
    expect(guard).toContain('.hero--neon h1');
    expect(guard).toMatch(/\{\s*animation:\s*none\s*;?\s*\}/);
  });

  it('keyframes only ever animate opacity / transform / text-shadow (no layout shift)', () => {
    for (const kf of KEYFRAMES) {
      const props = keyframeProps(kf);
      expect(props.length, `${kf} animates at least one property`).toBeGreaterThan(0);
      const offenders = props.filter((p) => !ANIMATABLE_WITHOUT_LAYOUT_SHIFT.has(p));
      expect(offenders, `${kf} must not animate ${offenders.join(', ')}`).toEqual([]);
    }
  });

  it('every variant fades opacity from 0', () => {
    for (const kf of KEYFRAMES.filter((k) => k !== 'hero-in-neon')) {
      expect(keyframeBody(kf), kf).toMatch(/opacity:\s*0\b/);
    }
    expect(keyframeBody('hero-in-neon'), 'neon ramps opacity').toMatch(/opacity:\s*0?\.\d/);
  });

  it('Fade — a real (visible) rise, not opacity-only', () => {
    const body = keyframeBody('hero-in-fade');
    const px = Number(body.match(/translateY\(\s*(\d+(?:\.\d+)?)px\s*\)/)?.[1]);
    expect(px, 'fade translateY(px)').toBeGreaterThan(0);
  });

  it('Slide Up — a clearly perceptible slide (>= 24px)', () => {
    const px = Number(
      keyframeBody('hero-in-slide').match(/translateY\(\s*(\d+(?:\.\d+)?)px\s*\)/)?.[1],
    );
    expect(px, 'slide translateY(px)').toBeGreaterThanOrEqual(24);
  });

  it('Zoom — a perceptible scale-in (<= 0.96), not the imperceptible 0.985', () => {
    const scale = Number(keyframeBody('hero-in-zoom').match(/scale\(\s*(\d*\.\d+)\s*\)/)?.[1]);
    expect(scale, 'zoom scale()').toBeGreaterThan(0);
    expect(scale, 'zoom scale() is noticeable').toBeLessThanOrEqual(0.96);
  });

  it('Neon — unchanged: an opacity ramp plus a text-shadow glow that fades out', () => {
    const body = keyframeBody('hero-in-neon');
    expect(body).toMatch(/0%\s*\{[^}]*opacity:\s*0\.25/);
    expect(body).toMatch(/55%\s*\{[^}]*text-shadow:[\s\S]*rgb\(255 107 53/);
    expect(body).toMatch(/100%\s*\{[^}]*text-shadow:\s*0 0 1px rgb\(255 107 53 \/ 0\)/);
    // still opacity/transform/text-shadow only
    expect(
      keyframeProps('hero-in-neon').filter((p) => !ANIMATABLE_WITHOUT_LAYOUT_SHIFT.has(p)),
    ).toEqual([]);
  });
});
