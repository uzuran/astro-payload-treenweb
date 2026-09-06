export const HERO_ANIMATIONS = ['fade', 'slide-up', 'zoom', 'neon'] as const;
export type HeroAnimation = (typeof HERO_ANIMATIONS)[number];

/** Fallback entrance length (seconds) when `AnimationSettings.duration` is unset. */
export const HERO_ANIMATION_DEFAULT_DURATION_S = 1.2;
const MIN_DURATION_S = 0.2;
const MAX_DURATION_S = 5;

/**
 * Narrow a CMS value (`SiteSettings.heroAnimation`) to a known animation,
 * degrading anything unknown / empty / non-string to `fade`.
 */
export function toHeroAnimation(value: unknown): HeroAnimation {
  return (HERO_ANIMATIONS as readonly string[]).includes(value as string)
    ? (value as HeroAnimation)
    : 'fade';
}

/**
 * A CSS `<time>` for the hero entrance, from `AnimationSettings.duration`
 * (seconds). Missing / non-finite / out-of-range → the 1.2s default. Feeds the
 * `--hero-anim-duration` custom property that Fade / Slide up / Zoom read in
 * `global.css`. Neon is unaffected.
 */
export function heroAnimationDurationCss(seconds: unknown): string {
  const n =
    typeof seconds === 'number'
      ? seconds
      : typeof seconds === 'string' && seconds.trim() !== ''
        ? Number(seconds)
        : NaN;
  const s =
    Number.isFinite(n) && n >= MIN_DURATION_S && n <= MAX_DURATION_S
      ? n
      : HERO_ANIMATION_DEFAULT_DURATION_S;
  return `${s}s`;
}
