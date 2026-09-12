import { describe, expect, it } from 'vitest';

import { publishedOrAuthenticated } from './publishedOrAuthenticated';

const reqWith = (user: unknown) => ({ req: { user } }) as never;

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
