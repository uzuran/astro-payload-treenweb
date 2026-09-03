import type { APIRoute } from 'astro';

import { env } from '../env';

export const prerender = false;

export const GET: APIRoute = () => {
  const sitemap = new URL('/sitemap.xml', env.PUBLIC_SITE_URL).href;
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    '',
    `Sitemap: ${sitemap}`,
    '',
  ].join('\n');
  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
