import { describe, expect, it } from 'vitest';

import { Users } from './Users';

/** Locks the admin-auth hardening so it can't silently regress. */
describe('Users.auth', () => {
  const auth = Users.auth as Exclude<typeof Users.auth, boolean | undefined>;

  it('locks accounts after a few failed logins', () => {
    expect(auth.maxLoginAttempts).toBeGreaterThan(0);
    expect(auth.maxLoginAttempts).toBeLessThanOrEqual(10);
    expect(auth.lockTime).toBeGreaterThanOrEqual(5 * 60 * 1000);
  });

  it('expires the session token within a working day', () => {
    expect(auth.tokenExpiration).toBeGreaterThan(0);
    expect(auth.tokenExpiration).toBeLessThanOrEqual(8 * 60 * 60);
  });

  it('scopes the auth cookie: SameSite=Lax, Secure only in production', () => {
    expect(auth.cookies).toMatchObject({ sameSite: 'Lax' });
    const secure = (auth.cookies as { secure?: unknown }).secure;
    // secure is `NODE_ENV === 'production'` — false under vitest, true in prod
    expect(secure).toBe(process.env.NODE_ENV === 'production');
  });

  it('does not expose an API-key strategy', () => {
    expect(auth.useAPIKey).not.toBe(true);
  });
});

describe('Users.access', () => {
  it('never allows an anonymous request to reach the admin', () => {
    const admin = Users.access?.admin;
    expect(typeof admin).toBe('function');
    expect(admin?.({ req: { user: null } } as never)).toBeFalsy();
    expect(admin?.({ req: { user: { id: '1' } } } as never)).toBeTruthy();
  });

  it('gates every CRUD op behind authentication', () => {
    for (const op of ['create', 'read', 'update', 'delete'] as const) {
      expect(typeof Users.access?.[op]).toBe('function');
      expect(Users.access?.[op]?.({ req: { user: null } } as never)).toBeFalsy();
    }
  });
});
