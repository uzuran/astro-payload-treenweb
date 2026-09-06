type JsonLd = Record<string, unknown>;

export function organizationJsonLd(siteUrl: string, siteName: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
  };
}

export function webPageJsonLd(opts: { title: string; description?: string; url: string }): JsonLd {
  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.title,
    url: opts.url,
  };
  if (opts.description) node.description = opts.description;
  return node;
}

export function articleJsonLd(opts: {
  title: string;
  description?: string;
  url: string;
  datePublished?: string | null;
  dateModified?: string | null;
}): JsonLd {
  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    url: opts.url,
  };
  if (opts.description) node.description = opts.description;
  if (opts.datePublished) node.datePublished = opts.datePublished;
  if (opts.dateModified) node.dateModified = opts.dateModified;
  return node;
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Serialise JSON-LD for safe embedding inside a <script> tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
