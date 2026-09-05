import type { APIRoute } from 'astro';

import { env } from '../env';
import { LOCALES, isLocale, localizedPath, type Locale } from '../lib/locale';
import {
  getSiteSettings,
  listSitemapEntries,
  PayloadError,
  type SitemapEntry,
} from '../lib/payload/client';
import { buildAlternates } from '../lib/seo/alternates';

export const prerender = false;

const abs = (path: string) => new URL(path, env.PUBLIC_SITE_URL).href;

/** One `<url>` per locale for a shared-slug base path, each carrying the full hreflang set. */
const urlBlocks = (
  basePath: string,
  updatedAt: string | undefined,
  locales: Locale[],
): string[] => {
  const lastmod = updatedAt ? `<lastmod>${new Date(updatedAt).toISOString()}</lastmod>` : '';
  const alternates = buildAlternates(basePath, locales)
    .map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}"/>`)
    .join('\n');
  return locales.map(
    (code) =>
      `  <url>\n    <loc>${abs(localizedPath(code, basePath))}</loc>${lastmod}\n${alternates}\n  </url>`,
  );
};

export const GET: APIRoute = async () => {
  let entries: SitemapEntry[] = [];
  let locales: Locale[] = [...LOCALES];

  try {
    const [list, settings] = await Promise.all([
      listSitemapEntries(),
      getSiteSettings().catch(() => null),
    ]);
    entries = list;
    const enabled = (settings?.supportedLocales ?? [])
      .filter((entry) => entry.enabled !== false)
      .map((entry) => entry.code)
      .filter(isLocale);
    if (enabled.length > 0) locales = enabled;
  } catch (err) {
    if (!(err instanceof PayloadError)) throw err;
    // Degrade to a minimal (home-only, all-locales) sitemap rather than 500 the crawler.
  }

  const updatedByPath = new Map(entries.map((entry) => [entry.path, entry.updatedAt]));
  const basePaths = ['/', ...entries.map((entry) => entry.path)];

  const urls = basePaths
    .flatMap((basePath) =>
      urlBlocks(basePath, basePath === '/' ? undefined : updatedByPath.get(basePath), locales),
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  });
};
