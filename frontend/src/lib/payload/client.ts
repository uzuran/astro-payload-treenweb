import { z } from 'zod';

import { env } from '../../env';

const TIMEOUT_MS = 8_000;

export class PayloadError extends Error {
  readonly status: number | undefined;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'PayloadError';
    this.status = status;
  }
}

async function apiFetch<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const url = new URL(path, env.PAYLOAD_INTERNAL_URL);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!res.ok) {
      throw new PayloadError(`Payload responded ${res.status} for ${path}`, res.status);
    }
    const json: unknown = await res.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new PayloadError(`Unexpected Payload response for ${path}: ${parsed.error.message}`);
    }
    return parsed.data;
  } catch (err) {
    if (err instanceof PayloadError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new PayloadError(`Payload request timed out after ${TIMEOUT_MS}ms for ${path}`);
    }
    throw new PayloadError(`Payload request failed for ${path}: ${String(err)}`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * `&locale=<code>` query suffix. Omits `fallback-locale` by default, so
 * Payload's config `fallback: true` backfills untranslated fields from the
 * default locale. Pass `strict` (QA / gap-finding only) to disable that —
 * untranslated fields then come back `null`.
 */
function localeQS(locale?: string, strict = false): string {
  if (!locale) return '';
  return `&locale=${encodeURIComponent(locale)}${strict ? '&fallback-locale=null' : ''}`;
}

// Minimal shapes for what the frontend reads. Step 6 replaces these with
// @treenweb/schemas backed by the generated Payload types.
const seoSchema = z
  .object({
    title: z.string().nullish(),
    description: z.string().nullish(),
    noindex: z.boolean().nullish(),
    image: z.unknown().nullish(),
  })
  .nullish();

export const pageSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  slug: z.string(),
  content: z.unknown().nullish(),
  seo: seoSchema,
  updatedAt: z.string().nullish(),
  publishedAt: z.string().nullish(),
});
export type Page = z.infer<typeof pageSchema>;

export const postSchema = pageSchema.extend({
  excerpt: z.string().nullish(),
});
export type Post = z.infer<typeof postSchema>;

const listOf = <T extends z.ZodTypeAny>(doc: T) =>
  z.object({ docs: z.array(doc), totalDocs: z.number() });

const query = (slug: string, locale?: string) =>
  `where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1${localeQS(locale)}`;

export async function getPageBySlug(slug: string, locale?: string): Promise<Page | null> {
  const data = await apiFetch(`/api/pages?${query(slug, locale)}`, listOf(pageSchema));
  return data.docs[0] ?? null;
}

export async function getPostBySlug(slug: string, locale?: string): Promise<Post | null> {
  const data = await apiFetch(`/api/posts?${query(slug, locale)}`, listOf(postSchema));
  return data.docs[0] ?? null;
}

// ─── Media ─────────────────────────────────────────────────────────────────

const mediaSizeSchema = z.object({
  url: z.string().nullish(),
  width: z.number().nullish(),
  height: z.number().nullish(),
});

export const mediaSchema = z.object({
  url: z.string().nullish(),
  alt: z.string().nullish(),
  width: z.number().nullish(),
  height: z.number().nullish(),
  mimeType: z.string().nullish(),
  sizes: z
    .object({
      thumbnail: mediaSizeSchema.nullish(),
      card: mediaSizeSchema.nullish(),
      hero: mediaSizeSchema.nullish(),
    })
    .nullish(),
});
export type Media = z.infer<typeof mediaSchema>;
export type MediaSize = 'thumbnail' | 'card' | 'hero';

/**
 * Absolute, browser-loadable URL for a Payload upload. Payload leaves
 * `serverURL` unset in dev, so upload `url`s come back relative — resolve them
 * against the public CMS origin, never the internal SSR host.
 */
export function mediaUrl(file: Media | null | undefined, size?: MediaSize): string | null {
  if (!file) return null;
  const relative = (size && file.sizes?.[size]?.url) || file.url;
  if (!relative) return null;
  return new URL(relative, env.PUBLIC_CMS_URL).href;
}

// ─── Globals (FORMA landing sections) ──────────────────────────────────────
//
// Every field is optional: a half-filled global renders with per-section
// fallbacks rather than throwing.

async function getGlobal<T>(
  slug: string,
  schema: z.ZodType<T>,
  depth = 0,
  locale?: string,
): Promise<T> {
  return apiFetch(`/api/globals/${slug}?depth=${depth}${localeQS(locale)}`, schema);
}

const sectionHeader = {
  eyebrow: z.string().nullish(),
  heading: z.string().nullish(),
  headingAccent: z.string().nullish(),
  note: z.string().nullish(),
};

export const heroSchema = z.object({
  eyebrowLeft: z.string().nullish(),
  eyebrowRight: z.string().nullish(),
  headingLine1: z.string().nullish(),
  headingAccent: z.string().nullish(),
  introText: z.string().nullish(),
  ctaLabel: z.string().nullish(),
  ctaHref: z.string().nullish(),
  sealText: z.string().nullish(),
  sealCaption: z.string().nullish(),
  photo: mediaSchema.nullish(),
  photoCaptionLeft: z.string().nullish(),
  photoCaptionRight: z.string().nullish(),
  rounded: z.string().nullish(),
  photoRounded: z.string().nullish(),
});
export type Hero = z.infer<typeof heroSchema>;

export const serviceItemSchema = z.object({
  name: z.string(),
  badge: z.string().nullish(),
  description: z.string().nullish(),
  duration: z.string().nullish(),
  priceAmount: z.number().nullish(),
  priceCurrency: z.string().nullish(),
  anchor: z.string().nullish(),
  id: z.string().nullish(),
});
export const servicesSchema = z.object({
  ...sectionHeader,
  items: z.array(serviceItemSchema).nullish(),
  rounded: z.string().nullish(),
});
export type Services = z.infer<typeof servicesSchema>;
export type ServiceItem = z.infer<typeof serviceItemSchema>;

export const aboutSchema = z.object({
  ...sectionHeader,
  leadParagraph: z.string().nullish(),
  bodyParagraph: z.string().nullish(),
  footnote: z.string().nullish(),
  rounded: z.string().nullish(),
});
export type About = z.infer<typeof aboutSchema>;

export const teamSchema = z.object({ ...sectionHeader, rounded: z.string().nullish() });
export type Team = z.infer<typeof teamSchema>;

export const bookingSchema = z.object({
  ...sectionHeader,
  intro: z.string().nullish(),
  disclaimer: z.string().nullish(),
  rounded: z.string().nullish(),
});
export type Booking = z.infer<typeof bookingSchema>;

const navItemSchema = z.object({
  label: z.string(),
  href: z.string(),
  id: z.string().nullish(),
});
export const navigationSchema = z.object({
  main: z.array(navItemSchema).nullish(),
  footer: z.array(navItemSchema).nullish(),
});
export type Navigation = z.infer<typeof navigationSchema>;
export type NavItem = z.infer<typeof navItemSchema>;

export const siteSettingsSchema = z.object({
  siteName: z.string().nullish(),
  tagline: z.string().nullish(),
  description: z.string().nullish(),
  ogImage: mediaSchema.nullish(),
  social: z
    .array(z.object({ platform: z.string(), url: z.string(), id: z.string().nullish() }))
    .nullish(),
  ticker: z.array(z.object({ word: z.string(), id: z.string().nullish() })).nullish(),
  contact: z
    .object({
      address: z.string().nullish(),
      phone: z.string().nullish(),
      hoursWeekday: z.string().nullish(),
      hoursSaturday: z.string().nullish(),
      hoursSunday: z.string().nullish(),
      mapUrl: z.string().nullish(),
    })
    .nullish(),
  footerNote: z.string().nullish(),
  heroAnimation: z.string().nullish(),
  defaultLocale: z.string().nullish(),
  supportedLocales: z
    .array(
      z.object({
        code: z.string(),
        label: z.string(),
        enabled: z.boolean().nullish(),
        id: z.string().nullish(),
      }),
    )
    .nullish(),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const getHero = (locale?: string) => getGlobal('hero', heroSchema, 1, locale);
export const getServices = (locale?: string) => getGlobal('services', servicesSchema, 0, locale);
export const getAbout = (locale?: string) => getGlobal('about', aboutSchema, 0, locale);
export const getTeam = (locale?: string) => getGlobal('team', teamSchema, 0, locale);
export const getBooking = (locale?: string) => getGlobal('booking', bookingSchema, 0, locale);
export const getNavigation = (locale?: string) =>
  getGlobal('navigation', navigationSchema, 0, locale);
export const getSiteSettings = (locale?: string) =>
  getGlobal('site-settings', siteSettingsSchema, 1, locale);

// ─── Masters (collection) ─────────────────────────────────────────────────

export const masterSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  initials: z.string().nullish(),
  specialty: z.string().nullish(),
  bookingLabel: z.string().nullish(),
  photo: mediaSchema.nullish(),
  order: z.number().nullish(),
});
export type Master = z.infer<typeof masterSchema>;

export async function listMasters(locale?: string): Promise<Master[]> {
  const data = await apiFetch(
    `/api/masters?sort=order&limit=100&depth=1${localeQS(locale)}`,
    listOf(masterSchema),
  );
  return data.docs;
}

const sitemapDoc = z.object({ slug: z.string(), updatedAt: z.string().nullish() });

export interface SitemapEntry {
  path: string;
  updatedAt?: string;
}

/** Published pages + posts, as sitemap paths. Anonymous access already filters to published. */
export async function listSitemapEntries(): Promise<SitemapEntry[]> {
  const [pages, posts] = await Promise.all([
    apiFetch(`/api/pages?limit=500&depth=0`, listOf(sitemapDoc)),
    apiFetch(`/api/posts?limit=500&depth=0`, listOf(sitemapDoc)),
  ]);
  return [
    ...pages.docs
      .filter((doc) => doc.slug !== 'home')
      .map((doc) => ({ path: `/${doc.slug}`, updatedAt: doc.updatedAt ?? undefined })),
    ...posts.docs.map((doc) => ({
      path: `/posts/${doc.slug}`,
      updatedAt: doc.updatedAt ?? undefined,
    })),
  ];
}
