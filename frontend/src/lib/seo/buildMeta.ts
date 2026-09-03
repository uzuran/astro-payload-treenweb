export const SITE_NAME = 'treenweb';
const TITLE_SUFFIX = ` · ${SITE_NAME}`;
const DEFAULT_DESCRIPTION = 'Secure, SEO-first web platform.';

export interface SeoInput {
  /** Page title, without the site-name suffix. */
  title: string;
  description?: string | null;
  /** Canonical path, e.g. `/about` or `/`. */
  path: string;
  /** Absolute URL or site-relative path to the social image. */
  image?: string | null;
  noindex?: boolean | null;
  type?: 'website' | 'article';
}

export interface MetaTags {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  og: Record<string, string>;
  twitter: Record<string, string>;
}

/** Pure builder for the <head> meta of a page. */
export function buildMeta(input: SeoInput, siteUrl: string): MetaTags {
  const rawTitle = input.title.trim() || SITE_NAME;
  const title = rawTitle.endsWith(TITLE_SUFFIX) ? rawTitle : `${rawTitle}${TITLE_SUFFIX}`;
  const description = (input.description ?? DEFAULT_DESCRIPTION).trim() || DEFAULT_DESCRIPTION;
  const canonical = new URL(input.path, siteUrl).href;
  const image = input.image ? new URL(input.image, siteUrl).href : undefined;
  const robots = input.noindex ? 'noindex, nofollow' : 'index, follow';

  const og: Record<string, string> = {
    'og:type': input.type ?? 'website',
    'og:title': title,
    'og:description': description,
    'og:url': canonical,
    'og:site_name': SITE_NAME,
  };
  if (image) og['og:image'] = image;

  const twitter: Record<string, string> = {
    'twitter:card': image ? 'summary_large_image' : 'summary',
    'twitter:title': title,
    'twitter:description': description,
  };
  if (image) twitter['twitter:image'] = image;

  return { title, description, canonical, robots, og, twitter };
}
