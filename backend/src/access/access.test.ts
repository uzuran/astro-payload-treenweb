import { describe, expect, it } from 'vitest';

import { anyone } from './anyone';
import { authenticated } from './authenticated';

// The AccessArgs type is large; a minimal stub is enough for these pure fns.
const reqWith = (user: unknown) => ({ req: { user } }) as never;

describe('access: anyone', () => {
  it('is always true, with or without a user', () => {
    expect(anyone(reqWith(null))).toBe(true);
    expect(anyone(reqWith({ id: '1' }))).toBe(true);
  });
});

describe('access: authenticated', () => {
  it('is false without a user', () => {
    expect(authenticated(reqWith(null))).toBe(false);
    expect(authenticated(reqWith(undefined))).toBe(false);
  });

  it('is true with a user', () => {
    expect(authenticated(reqWith({ id: '1' }))).toBe(true);
  });
});
