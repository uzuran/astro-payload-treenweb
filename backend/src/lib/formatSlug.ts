/** Lowercase, strip punctuation, collapse whitespace/underscores to single hyphens. */
export const formatSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
