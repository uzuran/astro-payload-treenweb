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
  // Tailwind v4 — configured entirely in src/styles/global.css (@import + @theme)
  vite: { plugins: [tailwindcss()] },
});
