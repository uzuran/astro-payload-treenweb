import { describe, expect, it } from 'vitest';

import { GENERIC_SOCIAL_ICON, SUPPORTED_SOCIAL, socialIcon } from './social';

describe('SUPPORTED_SOCIAL', () => {
  it('covers Instagram plus at least five more common platforms', () => {
    expect(SUPPORTED_SOCIAL).toContain('instagram');
    expect(SUPPORTED_SOCIAL.length).toBeGreaterThanOrEqual(6);
    for (const p of ['facebook', 'tiktok', 'youtube', 'telegram', 'whatsapp']) {
      expect(SUPPORTED_SOCIAL, p).toContain(p);
    }
  });
});

describe('socialIcon — known platforms', () => {
  it('resolves each supported key to a labelled single-path glyph', () => {
    for (const key of SUPPORTED_SOCIAL) {
      const icon = socialIcon(key);
      expect(icon.label, key).toBeTruthy();
      expect(icon.path, key).toMatch(/^[Mm]/); // a real SVG path
      expect(icon.path, key).not.toBe(GENERIC_SOCIAL_ICON.path);
    }
  });

  it('normalises case and surrounding whitespace', () => {
    expect(socialIcon('  Instagram ')).toEqual(socialIcon('instagram'));
    expect(socialIcon('YOUTUBE')).toEqual(socialIcon('youtube'));
  });

  it('maps common aliases to their canonical icon', () => {
    expect(socialIcon('twitter')).toEqual(socialIcon('x'));
    expect(socialIcon('fb')).toEqual(socialIcon('facebook'));
    expect(socialIcon('ig')).toEqual(socialIcon('instagram'));
    expect(socialIcon('yt')).toEqual(socialIcon('youtube'));
    expect(socialIcon('tg')).toEqual(socialIcon('telegram'));
    expect(socialIcon('wa')).toEqual(socialIcon('whatsapp'));
  });
});

describe('socialIcon — unknown platforms', () => {
  it('falls back to the generic glyph, keeping the raw text as the label', () => {
    const icon = socialIcon('Pinterest');
    expect(icon.path).toBe(GENERIC_SOCIAL_ICON.path);
    expect(icon.label).toBe('Pinterest');
  });

  it('uses the generic label when the platform is empty or missing', () => {
    for (const v of ['', '   ', null, undefined]) {
      const icon = socialIcon(v);
      expect(icon.path, JSON.stringify(v)).toBe(GENERIC_SOCIAL_ICON.path);
      expect(icon.label, JSON.stringify(v)).toBe(GENERIC_SOCIAL_ICON.label);
    }
  });

  it('is pure — same input, same output', () => {
    expect(socialIcon('instagram')).toEqual(socialIcon('instagram'));
    expect(socialIcon('???')).toEqual(socialIcon('???'));
  });
});
