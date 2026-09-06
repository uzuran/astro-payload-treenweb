import { describe, expect, it } from 'vitest';

import { ROUNDED, roundedClass, toRounded } from './rounded';

describe('toRounded', () => {
  it('passes every whitelisted value through', () => {
    for (const v of ROUNDED) expect(toRounded(v)).toBe(v);
  });

  it('degrades anything out of range to "none"', () => {
    for (const v of ['xl', 'None', 'FULL', '', ' sm', 0, undefined, null, {}, ['lg']]) {
      expect(toRounded(v)).toBe('none');
    }
  });
});

describe('roundedClass', () => {
  it('emits the paired `rounded rounded--<value>` classes', () => {
    expect(roundedClass('md')).toBe('rounded rounded--md');
    expect(roundedClass('full')).toBe('rounded rounded--full');
  });

  it('emits the `none` variant for unknown input, never a bare/undefined suffix', () => {
    expect(roundedClass('bogus')).toBe('rounded rounded--none');
    expect(roundedClass(undefined)).toBe('rounded rounded--none');
  });

  it('always starts with the plain `rounded` hook class', () => {
    for (const v of [...ROUNDED, 'bogus', null]) {
      expect(roundedClass(v).split(' ')[0]).toBe('rounded');
    }
  });
});
