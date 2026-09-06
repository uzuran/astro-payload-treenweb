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

/** Static hero image in public/, used when Payload has no hero photo. Locale-neutral. */
export const HERO_PHOTO_SRC_FB = '/hero.jpg';
