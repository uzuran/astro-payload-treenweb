import { describe, expect, it } from 'vitest';

import { HONEYPOT_FIELD, isBot, parseBooking } from './booking';

const NOW = new Date('2030-06-01T12:00:00Z');
const valid = {
  name: 'Tester',
  phone: '+420 123 456 789',
  service: 'Haircut',
  master: 'Any',
  date: '2030-06-15',
};

describe('isBot', () => {
  it('is true only when the honeypot field is filled', () => {
    expect(isBot({})).toBe(false);
    expect(isBot({ [HONEYPOT_FIELD]: '' })).toBe(false);
    expect(isBot({ [HONEYPOT_FIELD]: '   ' })).toBe(false);
    expect(isBot({ [HONEYPOT_FIELD]: 'Acme Inc' })).toBe(true);
  });
});

describe('parseBooking', () => {
  it('accepts a well-formed enquiry and trims it', () => {
    const r = parseBooking({ ...valid, name: '  Tester  ' }, NOW);
    expect(r).toEqual({
      ok: true,
      data: {
        name: 'Tester',
        phone: '+420 123 456 789',
        service: 'Haircut',
        master: 'Any',
        date: '2030-06-15',
      },
    });
  });

  it('treats an empty master as null', () => {
    const r = parseBooking({ ...valid, master: '' }, NOW);
    expect(r.ok && r.data.master).toBeNull();
  });

  it('flags missing name / service', () => {
    const r = parseBooking({ ...valid, name: '  ', service: '' }, NOW);
    expect(r).toMatchObject({ ok: false, errors: { name: 'required', service: 'required' } });
  });

  it('rejects a bad phone', () => {
    for (const phone of ['', 'abc', '123', 'x'.repeat(21), '++<script>']) {
      expect(parseBooking({ ...valid, phone }, NOW), phone).toMatchObject({
        ok: false,
        errors: { phone: 'invalid' },
      });
    }
    expect(parseBooking({ ...valid, phone: '(777) 12-34-56' }, NOW).ok).toBe(true);
  });

  it('rejects past, malformed and impossible dates', () => {
    for (const date of [
      '2030-05-30',
      '2020-01-01',
      'soon',
      '2030-13-01',
      '2030-02-31',
      '30-06-15',
    ]) {
      expect(parseBooking({ ...valid, date }, NOW), date).toMatchObject({
        ok: false,
        errors: { date: 'invalid' },
      });
    }
  });

  it('accepts today (with a 1-day grace for timezone skew)', () => {
    expect(parseBooking({ ...valid, date: '2030-06-01' }, NOW).ok).toBe(true);
    expect(parseBooking({ ...valid, date: '2030-05-31' }, NOW).ok).toBe(true); // grace
  });

  it('caps field lengths', () => {
    expect(parseBooking({ ...valid, name: 'a'.repeat(101) }, NOW).ok).toBe(false);
    expect(parseBooking({ ...valid, master: 'm'.repeat(101) }, NOW)).toMatchObject({
      ok: false,
      errors: { master: 'invalid' },
    });
  });

  it('ignores non-string input', () => {
    expect(parseBooking({ name: 123, phone: null, service: {}, date: [] }, NOW).ok).toBe(false);
  });
});
