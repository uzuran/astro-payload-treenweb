import type { Field, GlobalConfig } from 'payload';
import { describe, expect, it } from 'vitest';

import { VescoCounters } from './VescoCounters';
import { VescoCta } from './VescoCta';
import { VescoFooter } from './VescoFooter';
import { VescoHero } from './VescoHero';
import { VescoNavigation } from './VescoNavigation';

const GLOBALS: GlobalConfig[] = [VescoNavigation, VescoHero, VescoCounters, VescoCta, VescoFooter];

/** Every text/textarea leaf under a global's fields, recursing into groups. */
function leafFields(fields: Field[]): Field[] {
  return fields.flatMap((f) => {
    if (f.type === 'group') return leafFields((f as { fields: Field[] }).fields);
    return [f];
  });
}

describe('Vesco content globals', () => {
  it.each(GLOBALS)('$slug: read is public, update requires auth', (global) => {
    expect(global.access?.read).toBeTruthy();
    expect(global.access?.update).toBeTruthy();
    const readAllows = global.access!.read!({ req: { user: null } } as never);
    expect(readAllows).toBeTruthy();
    const updateDeniesAnon = global.access!.update!({ req: { user: null } } as never);
    expect(updateDeniesAnon).toBeFalsy();
  });

  it.each(GLOBALS)('$slug: every text/textarea field is localized', (global) => {
    const leaves = leafFields(global.fields).filter(
      (f) => f.type === 'text' || f.type === 'textarea',
    );
    expect(leaves.length).toBeGreaterThan(0);
    for (const field of leaves) {
      expect(
        Boolean((field as { localized?: boolean }).localized),
        `${global.slug}.${(field as { name?: string }).name} must be localized:true — the whole point of these globals is per-locale copy`,
      ).toBe(true);
    }
  });
});
