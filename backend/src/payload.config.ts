import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { Posts } from './collections/Posts';
import { Redirects } from './collections/Redirects';
import { Users } from './collections/Users';
import { emailAdapter } from './email';
import { env } from './env';
import { reportError } from './lib/errorReporter';
import { AnimationSettings } from './globals/AnimationSettings';
import { Navigation } from './globals/Navigation';
import { SiteSettings } from './globals/SiteSettings';
import { UiLabels } from './globals/UiLabels';
import { lexicalFeatures } from './lexical/allowlist';
import { DEFAULT_LOCALE, LOCALE_LABELS, LOCALES } from './locales';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  // In dev leave this unset so the admin talks to its own origin (works behind
  // any local port or tunnel). Prod pins the public URL.
  serverURL: env.NODE_ENV === 'production' ? env.PAYLOAD_PUBLIC_SERVER_URL : undefined,
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' · treenweb CMS' },
  },
  editor: lexicalEditor({ features: () => lexicalFeatures }),
  // Multilingual content. Fields opt in with `localized: true`; everything else
  // is shared across locales. `fallback` returns the default-locale value when a
  // translation is missing, so a page is never blank in a new language.
  localization: {
    locales: LOCALES.map((code) => ({ code, label: LOCALE_LABELS[code] })),
    defaultLocale: DEFAULT_LOCALE,
    fallback: true,
  },
  // System / reusable content types only. A template adds its own collections
  // and content globals here.
  collections: [Pages, Posts, Media, Redirects, Users],
  globals: [SiteSettings, Navigation, UiLabels, AnimationSettings],
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URL },
    push: env.PAYLOAD_DB_PUSH,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  secret: env.PAYLOAD_SECRET,
  // Forward unhandled 5xx errors to ALERT_WEBHOOK_URL (throttled). No-op if unset.
  hooks: {
    afterError: [
      ({ error }) => {
        void reportError(error);
      },
    ],
  },
  // Real SMTP when SMTP_URL is set; otherwise Payload's console adapter (dev).
  email: emailAdapter(),
  // Dev is permissive so the admin works through any local or tunnelled
  // origin. Prod uses the explicit allowlists.
  cors: env.NODE_ENV === 'production' ? env.CORS_ORIGINS : '*',
  csrf: env.NODE_ENV === 'production' ? env.CSRF_ORIGINS : [],
  // Cap relationship population on the public REST API (default 10). The
  // frontend never asks for more than depth=1; the admin stays well under 5.
  maxDepth: 5,
  // GraphQL is unused — the frontend and admin are REST + Local API only.
  // Disabling drops the /api/graphql and /api/graphql-playground routes,
  // which also lets `next build` run without a reachable database (it
  // otherwise eagerly builds the GraphQL schema while collecting page data).
  graphQL: { disable: true },
  telemetry: false,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },
  upload: {
    limits: { fileSize: 5_000_000 }, // 5 MB
  },
});
