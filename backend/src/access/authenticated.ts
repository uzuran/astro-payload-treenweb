import type { Access } from 'payload';

/** Any logged-in user. */
export const authenticated: Access = ({ req }) => Boolean(req.user);
