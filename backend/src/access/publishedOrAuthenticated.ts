import type { Access } from 'payload';

/**
 * Public read of published documents; a logged-in user (the admin, previewing
 * drafts) sees everything. Pair with `versions: { drafts: true }` so `_status`
 * exists on the collection.
 */
export const publishedOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true;
  return { _status: { equals: 'published' } };
};
