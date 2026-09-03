import type { APIRoute } from 'astro';

import { env } from '../env';
import { listSitemapEntries, PayloadError, type SitemapEntry } from '../lib/payload/client';

export const prerender = false;

const toUrl = (entry: SitemapEntry): string => {
  const loc = new URL(entry.path, env.PUBLIC_SITE_URL).href;
  const lastmod = entry.updatedAt
    ? `<lastmod>${new Date(entry.updatedAt).toISOString()}</lastmod>`
    : '';
  return `  <url><loc>${loc}</loc>${lastmod}</url>`;
};

export const GET: APIRoute = async () => {
  let entries: SitemapEntry[] = [];
  try {
    entries = await listSitemapEntries();
  } catch (err) {
    if (!(err instanceof PayloadError)) throw err;
    // Degrade to a minimal sitemap rather than 500 the crawler.
  }

  const urls = [{ path: '/' }, ...entries].map(toUrl).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  });
};
