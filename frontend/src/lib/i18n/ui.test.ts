import { describe, expect, it } from 'vitest';

import { LOCALES } from '../locale';
import { UI_FALLBACK } from './ui';

const leaves = (o: Record<string, Record<string, string>>) =>
  Object.entries(o).flatMap(([g, kv]) => Object.keys(kv).map((k) => `${g}.${k}`));

describe('UI_FALLBACK', () => {
  const ru = leaves(UI_FALLBACK.ru).sort();

  it('every locale has exactly the ru leaf set', () => {
    for (const l of LOCALES) expect(leaves(UI_FALLBACK[l]).sort(), l).toEqual(ru);
  });

  it('no leaf is empty', () => {
    for (const l of LOCALES) {
      for (const [g, kv] of Object.entries(UI_FALLBACK[l])) {
        for (const [k, v] of Object.entries(kv)) expect(v, `${l}.${g}.${k}`).not.toBe('');
      }
    }
  });

  it('keeps the interpolation tokens in the templated leaves', () => {
    for (const l of LOCALES) {
      for (const tok of ['{name}', '{service}', '{date}']) {
        expect(UI_FALLBACK[l].booking.resultTemplate, `${l} ${tok}`).toContain(tok);
      }
      expect(UI_FALLBACK[l].notFound.missingPathTemplate, l).toContain('{path}');
    }
  });
});
