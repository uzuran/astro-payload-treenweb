export const SITE_NAME = 'treenweb';
const DEFAULT_DESCRIPTION = 'Secure, SEO-first web platform.';

export interface Alternate {
  hreflang: string;
  href: string;
}

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
  /** Site name for the title suffix + og:site_name. Defaults to SITE_NAME. */
  siteName?: string | null;
  /** BCP-47 locale for og:locale. i18n is not enabled yet — usually the site default. */
  locale?: string | null;
  /** hreflang alternates. Populate only when the site actually serves >1 locale. */
  alternates?: Alternate[];
}

export interface MetaTags {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  og: Record<string, string>;
  twitter: Record<string, string>;
  alternates: Alternate[];
}

/** Pure builder for the <head> meta of a page. */
export function buildMeta(input: SeoInput, siteUrl: string): MetaTags {
  const siteName = (input.siteName ?? SITE_NAME).trim() || SITE_NAME;
  const rawTitle = input.title.trim() || siteName;
  // Append " · <siteName>" unless the title already carries the site name.
  const title = rawTitle.toLowerCase().includes(siteName.toLowerCase())
    ? rawTitle
    : `${rawTitle} · ${siteName}`;
  const description = (input.description ?? DEFAULT_DESCRIPTION).trim() || DEFAULT_DESCRIPTION;
  const canonical = new URL(input.path, siteUrl).href;
  const image = input.image ? new URL(input.image, siteUrl).href : undefined;
  const robots = input.noindex ? 'noindex, nofollow' : 'index, follow';

  const og: Record<string, string> = {
    'og:type': input.type ?? 'website',
    'og:title': title,
    'og:description': description,
    'og:url': canonical,
    'og:site_name': siteName,
  };
  if (image) og['og:image'] = image;
  if (input.locale) og['og:locale'] = input.locale;

  const twitter: Record<string, string> = {
    'twitter:card': image ? 'summary_large_image' : 'summary',
    'twitter:title': title,
    'twitter:description': description,
  };
  if (image) twitter['twitter:image'] = image;

  return {
    title,
    description,
    canonical,
    robots,
    og,
    twitter,
    alternates: input.alternates ?? [],
  };
}
