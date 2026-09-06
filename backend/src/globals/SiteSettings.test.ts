import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { SiteSettings } from './SiteSettings';

const byName = (fields: Field[], name: string) =>
  fields.find((f) => (f as { name?: string }).name === name) as Record<string, unknown> | undefined;

describe('SiteSettings', () => {
  it('keeps defaultLocale a required select', () => {
    const f = byName(SiteSettings.fields as Field[], 'defaultLocale');
    expect(f?.type).toBe('select');
    expect(f?.required).toBe(true);
  });

  it('has a non-localized `social` array of { platform, url } required text fields', () => {
    const social = byName(SiteSettings.fields as Field[], 'social');
    expect(social?.type).toBe('array');
    expect(Boolean((social as { localized?: boolean }).localized)).toBe(false);
    const leaves = (social?.fields as Field[]).map((f) => ({
      name: (f as { name: string }).name,
      type: f.type,
      required: Boolean((f as { required?: boolean }).required),
    }));
    expect(leaves).toEqual([
      { name: 'platform', type: 'text', required: true },
      { name: 'url', type: 'text', required: true },
    ]);
  });

  it('has a localized `seo` group with titleTemplate + defaultDescription', () => {
    const seo = byName(SiteSettings.fields as Field[], 'seo');
    expect(seo?.type).toBe('group');
    const leaves = (seo?.fields as Field[]).map((f) => ({
      name: (f as { name: string }).name,
      type: f.type,
      localized: Boolean((f as { localized?: boolean }).localized),
    }));
    expect(leaves).toEqual([
      { name: 'titleTemplate', type: 'text', localized: true },
      { name: 'defaultDescription', type: 'textarea', localized: true },
    ]);
  });
});
