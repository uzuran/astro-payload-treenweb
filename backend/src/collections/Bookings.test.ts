import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';
import { Bookings } from './Bookings';

const field = (name: string) =>
  (Bookings.fields as Field[]).find((f) => (f as { name?: string }).name === name) as
    Record<string, unknown> | undefined;

describe('Bookings access', () => {
  it('is public to create, staff-only to read/update/delete', () => {
    expect(Bookings.access?.create).toBe(anyone);
    expect(Bookings.access?.read).toBe(authenticated);
    expect(Bookings.access?.update).toBe(authenticated);
    expect(Bookings.access?.delete).toBe(authenticated);
  });
});

describe('Bookings fields', () => {
  it('requires name / phone / service / date', () => {
    for (const name of ['name', 'phone', 'service', 'date']) {
      expect(field(name)?.required, name).toBe(true);
    }
    expect(field('master')?.required).toBeFalsy();
  });

  it('validates the phone format', () => {
    const validate = field('phone')?.validate as (v: unknown) => true | string;
    expect(validate('+420 123 456 789')).toBe(true);
    expect(validate('(777) 111-22-33')).toBe(true);
    expect(validate('abc')).not.toBe(true);
    expect(validate('12345')).not.toBe(true);
    expect(validate(42)).not.toBe(true);
  });

  it('offers new / confirmed / cancelled, defaulting to new', () => {
    const status = field('status');
    expect(status?.defaultValue).toBe('new');
    const values = (status?.options as { value: string }[]).map((o) => o.value);
    expect(values).toEqual(['new', 'confirmed', 'cancelled']);
  });
});

describe('Bookings beforeChange hook', () => {
  const hook = Bookings.hooks?.beforeChange?.[0] as (args: {
    operation: string;
    data: Record<string, unknown>;
  }) => Record<string, unknown>;

  it('forces status=new and source=website on an anonymous create', () => {
    const out = hook({
      operation: 'create',
      data: { name: 'x', status: 'confirmed', source: 'forged' },
    });
    expect(out).toMatchObject({ status: 'new', source: 'website' });
  });

  it('leaves updates alone', () => {
    const data = { status: 'confirmed', source: 'website' };
    expect(hook({ operation: 'update', data })).toBe(data);
  });
});
