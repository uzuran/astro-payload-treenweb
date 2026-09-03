import { describe, expect, it } from 'vitest';

import { anyone } from './anyone';
import { authenticated } from './authenticated';
import { publishedOrAuthenticated } from './publishedOrAuthenticated';

// The AccessArgs type is large; a minimal stub is enough for these pure fns.
const reqWith = (user: unknown) => ({ req: { user } }) as never;

describe('access: anyone', () => {
  it('is always true', () => {
    expect(anyone(reqWith(null))).toBe(true);
  });
});

describe('access: authenticated', () => {
  it('is false without a user', () => {
    expect(authenticated(reqWith(null))).toBe(false);
  });
  it('is true with a user', () => {
    expect(authenticated(reqWith({ id: '1' }))).toBe(true);
  });
});

describe('access: publishedOrAuthenticated', () => {
  it('grants full access to a logged-in user', () => {
    expect(publishedOrAuthenticated(reqWith({ id: '1' }))).toBe(true);
  });
  it('restricts anonymous reads to published documents', () => {
    expect(publishedOrAuthenticated(reqWith(null))).toEqual({
      _status: { equals: 'published' },
    });
  });
});
