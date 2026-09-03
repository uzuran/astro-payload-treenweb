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

const query = (slug: string) => `where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`;

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const data = await apiFetch(`/api/pages?${query(slug)}`, listOf(pageSchema));
  return data.docs[0] ?? null;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const data = await apiFetch(`/api/posts?${query(slug)}`, listOf(postSchema));
  return data.docs[0] ?? null;
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
