/**
 * Locale-aware bundled copy of the FORMA landing content. Every section resolves
 * its blanks through `getFallback(locale)`, so the page renders in full — and in
 * the right language — even when the CMS is unreachable or a field is empty.
 * Keep the per-locale files in sync with backend/src/seed/index.ts.
 */
import { formaCs } from './forma/cs';
import { formaEn } from './forma/en';
import { formaRu } from './forma/ru';
import type { FormaContent } from './forma/types';
import { DEFAULT_LOCALE, type Locale } from './locale';

const BUNDLE: Record<Locale, FormaContent> = { ru: formaRu, en: formaEn, cs: formaCs };

/** Bundled fallback content for a locale (DEFAULT_LOCALE for anything unknown). */
export function getFallback(locale: Locale): FormaContent {
  return BUNDLE[locale] ?? BUNDLE[DEFAULT_LOCALE];
}

export type { FormaContent };

/**
 * Static hero image (public/), used when Payload has no hero photo. Locale-
 * neutral. Pre-generated responsive WebP; `WH` are the source pixel dims so the
 * <img> reserves the right box (no layout shift) at any rendered width.
 */
export const HERO_PHOTO_SRC_FB = '/hero-1200.webp';
export const HERO_PHOTO_SRCSET_FB =
  '/hero-800.webp 800w, /hero-1200.webp 1200w, /hero-1600.webp 1600w';
export const HERO_PHOTO_FB_W = 1667;
export const HERO_PHOTO_FB_H = 2500;
