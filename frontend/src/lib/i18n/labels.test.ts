import { describe, expect, it } from 'vitest';

import { interpolate, resolveLabels } from './labels';
import { UI_FALLBACK } from './ui';

describe('interpolate', () => {
  it('replaces every occurrence of each token', () => {
    expect(interpolate('{a}-{b}-{a}', { a: 'x', b: 'y' })).toBe('x-y-x');
  });

  it('leaves unknown tokens untouched', () => {
    expect(interpolate('{a}{c}', { a: 'x' })).toBe('x{c}');
  });
});

describe('resolveLabels', () => {
  it('returns the bundled fallback for the locale when the CMS global is null', () => {
    const l = resolveLabels(null, 'en');
    expect(l.header.cta).toBe(UI_FALLBACK.en.header.cta);
    expect(l.notFound.backHomeLabel).toBe(UI_FALLBACK.en.notFound.backHomeLabel);
    expect(l.booking.resultTemplate).toBe(UI_FALLBACK.en.booking.resultTemplate);
  });

  it('prefers a non-empty CMS value over the fallback', () => {
    const l = resolveLabels({ header: { cta: 'Rezervovat' } }, 'cs');
    expect(l.header.cta).toBe('Rezervovat');
  });

  it('ignores a whitespace-only CMS value', () => {
    const l = resolveLabels({ booking: { submitLabel: '   ' } }, 'cs');
    expect(l.booking.submitLabel).toBe(UI_FALLBACK.cs.booking.submitLabel);
  });

  it('falls back per field, not per group', () => {
    const l = resolveLabels({ footer: { findUsHeading: 'KDE JSME' } }, 'cs');
    expect(l.footer.findUsHeading).toBe('KDE JSME');
    expect(l.footer.hoursHeading).toBe(UI_FALLBACK.cs.footer.hoursHeading);
  });

  it('uses the DEFAULT_LOCALE fallback for an unknown locale', () => {
    // @ts-expect-error — deliberate bad locale
    const l = resolveLabels(null, 'de');
    expect(l.header.cta).toBe(UI_FALLBACK.ru.header.cta);
  });

  it('exposes the full label surface', () => {
    expect(Object.keys(resolveLabels(null, 'ru')).sort()).toEqual([
      'booking',
      'footer',
      'header',
      'notFound',
    ]);
  });
});
