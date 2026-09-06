import { describe, expect, it } from 'vitest';

import {
  HERO_ANIMATION_DEFAULT_DURATION_S,
  HERO_ANIMATIONS,
  heroAnimationDurationCss,
  toHeroAnimation,
} from './heroAnimation';

describe('HERO_ANIMATIONS', () => {
  it('is exactly the four admin-selectable variants', () => {
    expect([...HERO_ANIMATIONS]).toEqual(['fade', 'slide-up', 'zoom', 'neon']);
  });
});

describe('toHeroAnimation — one case per animation option', () => {
  it('Fade → "fade"', () => expect(toHeroAnimation('fade')).toBe('fade'));
  it('Slide Up → "slide-up"', () => expect(toHeroAnimation('slide-up')).toBe('slide-up'));
  it('Zoom → "zoom"', () => expect(toHeroAnimation('zoom')).toBe('zoom'));
  it('Neon → "neon"', () => expect(toHeroAnimation('neon')).toBe('neon'));
});

describe('toHeroAnimation', () => {
  it('passes every known variant through unchanged', () => {
    for (const a of HERO_ANIMATIONS) expect(toHeroAnimation(a)).toBe(a);
  });

  it('degrades anything unknown / empty / non-string to "fade"', () => {
    for (const v of [
      'spin',
      'slide', // close but not a variant
      'FADE', // wrong case
      ' fade', // whitespace
      '',
      undefined,
      null,
      0,
      3,
      true,
      {},
      ['fade'],
      NaN,
    ]) {
      expect(toHeroAnimation(v), JSON.stringify(v)).toBe('fade');
    }
  });

  it('is a pure function (same input → same output)', () => {
    expect(toHeroAnimation('neon')).toBe(toHeroAnimation('neon'));
    expect(toHeroAnimation('???')).toBe(toHeroAnimation('???'));
  });
});

describe('heroAnimationDurationCss', () => {
  it('default is 1.2s and matches the exported constant', () => {
    expect(HERO_ANIMATION_DEFAULT_DURATION_S).toBe(1.2);
    expect(heroAnimationDurationCss(undefined)).toBe('1.2s');
    expect(heroAnimationDurationCss(null)).toBe('1.2s');
  });

  it('passes a valid admin value straight through as a CSS <time>', () => {
    expect(heroAnimationDurationCss(2)).toBe('2s');
    expect(heroAnimationDurationCss(0.9)).toBe('0.9s');
    expect(heroAnimationDurationCss(3.5)).toBe('3.5s');
    expect(heroAnimationDurationCss('2.4')).toBe('2.4s'); // numeric string coerces
  });

  it('falls back to the default for out-of-range or nonsense values', () => {
    for (const bad of [0, 0.1, 5.01, 100, -1, NaN, Infinity, 'fast', {}, [], true]) {
      expect(heroAnimationDurationCss(bad), JSON.stringify(bad)).toBe('1.2s');
    }
  });

  it('accepts the documented 0.2s–5s bounds inclusively', () => {
    expect(heroAnimationDurationCss(0.2)).toBe('0.2s');
    expect(heroAnimationDurationCss(5)).toBe('5s');
  });
});
