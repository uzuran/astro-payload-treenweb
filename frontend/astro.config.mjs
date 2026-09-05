// @ts-check
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const site = process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site,
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'never',
  build: { format: 'directory' },
  // Astro's Origin check for non-GET requests (defense in depth; Traefik adds more in Step 8)
  security: { checkOrigin: true },
  server: { host: true, port: 4321 },
  devToolbar: { enabled: false },
  // Multilingual routing is done with a plain `src/pages/[locale]/**` segment
  // (not Astro's `i18n` route generation, which fought the dynamic segment).
  // Locale codes + validation live in src/lib/locale.ts; `/` redirects to /ru/.
  // Tailwind v4 — configured entirely in src/styles/global.css (@import + @theme)
  vite: { plugins: [tailwindcss()] },
});
