import type { Access } from 'payload';

/**
 * Logged-in users see everything; everyone else sees only published documents.
 * Returned as a query constraint so it composes with the caller's `where`.
 */
export const publishedOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true;
  return {
    _status: { equals: 'published' },
  };
};
