import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Masters } from './collections/Masters';
import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { Posts } from './collections/Posts';
import { Redirects } from './collections/Redirects';
import { Users } from './collections/Users';
import { env } from './env';
import { About } from './globals/About';
import { AnimationSettings } from './globals/AnimationSettings';
import { Booking } from './globals/Booking';
import { Hero } from './globals/Hero';
import { Navigation } from './globals/Navigation';
import { Services } from './globals/Services';
import { SiteSettings } from './globals/SiteSettings';
import { Team } from './globals/Team';
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
  collections: [Pages, Posts, Media, Masters, Redirects, Users],
  globals: [
    SiteSettings,
    Navigation,
    UiLabels,
    AnimationSettings,
    Hero,
    Services,
    About,
    Team,
    Booking,
  ],
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URL },
    push: env.PAYLOAD_DB_PUSH,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  secret: env.PAYLOAD_SECRET,
  // Dev is permissive so the admin works through any local or tunnelled
  // origin. Prod uses the explicit allowlists.
  cors: env.NODE_ENV === 'production' ? env.CORS_ORIGINS : '*',
  csrf: env.NODE_ENV === 'production' ? env.CSRF_ORIGINS : [],
  graphQL: { disablePlaygroundInProduction: true },
  telemetry: false,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },
  upload: {
    limits: { fileSize: 5_000_000 }, // 5 MB
  },
});
