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
  /** Site name for the title suffix + og:site_name. Omit → no suffix, no og:site_name. */
  siteName?: string | null;
  /** "{page} · {site}" template from SiteSettings.seo.titleTemplate. Overrides the default suffix. */
  titleTemplate?: string | null;
  /** BCP-47 locale of this page — drives og:locale. */
  locale?: string | null;
  /** Other locales this page exists in — drives og:locale:alternate. */
  localeAlternates?: string[];
  /** hreflang alternates. Populate only when the site actually serves >1 locale. */
  alternates?: Alternate[];
}

export interface MetaTags {
  title: string;
  /** May be '' — BaseHead / og / twitter omit the tag when empty. */
  description: string;
  canonical: string;
  robots: string;
  og: Record<string, string>;
  /** Repeatable <meta property> tags the flat `og` map can't hold (og:locale:alternate). */
  ogRepeatable: [string, string][];
  twitter: Record<string, string>;
  alternates: Alternate[];
}

/**
 * Pure builder for the <head> meta of a page. Carries no hard-coded copy: the
 * caller supplies title / description / siteName (from Payload, or the offline
 * fallback bundle). An empty description or siteName just drops the tag.
 */
export function buildMeta(input: SeoInput, siteUrl: string): MetaTags {
  const siteName = (input.siteName ?? '').trim();
  const rawTitle = input.title.trim() || siteName;
  const template = (input.titleTemplate ?? '').trim();

  let title: string;
  if (template) {
    title = template.replaceAll('{page}', rawTitle).replaceAll('{site}', siteName).trim();
  } else if (siteName && !rawTitle.toLowerCase().includes(siteName.toLowerCase())) {
    title = `${rawTitle} · ${siteName}`;
  } else {
    title = rawTitle;
  }

  const description = (input.description ?? '').trim();
  const canonical = new URL(input.path, siteUrl).href;
  const image = input.image ? new URL(input.image, siteUrl).href : undefined;
  const robots = input.noindex ? 'noindex, nofollow' : 'index, follow';

  const og: Record<string, string> = {
    'og:type': input.type ?? 'website',
    'og:title': title,
    'og:url': canonical,
  };
  if (description) og['og:description'] = description;
  if (siteName) og['og:site_name'] = siteName;
  if (image) og['og:image'] = image;
  if (input.locale) og['og:locale'] = input.locale;

  const ogRepeatable: [string, string][] = (input.localeAlternates ?? [])
    .filter((code) => code && code !== input.locale)
    .map((code) => ['og:locale:alternate', code]);

  const twitter: Record<string, string> = {
    'twitter:card': image ? 'summary_large_image' : 'summary',
    'twitter:title': title,
  };
  if (description) twitter['twitter:description'] = description;
  if (image) twitter['twitter:image'] = image;

  return {
    title,
    description,
    canonical,
    robots,
    og,
    ogRepeatable,
    twitter,
    alternates: input.alternates ?? [],
  };
}
