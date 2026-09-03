import { describe, expect, it } from 'vitest';

import { renderRichText } from './render';

const lexical = (...paragraphs: string[]) => ({
  root: {
    type: 'root',
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      children: [{ type: 'text', text }],
    })),
  },
});

describe('renderRichText (placeholder)', () => {
  it('returns an empty string for null / malformed content', () => {
    expect(renderRichText(null)).toBe('');
    expect(renderRichText({})).toBe('');
    expect(renderRichText({ root: {} })).toBe('');
  });

  it('wraps each block in a <p>', () => {
    expect(renderRichText(lexical('one', 'two'))).toBe('<p>one</p>\n<p>two</p>');
  });

  it('escapes HTML so script payloads cannot execute', () => {
    const out = renderRichText(lexical('<script>alert(1)</script>'));
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('drops empty blocks', () => {
    expect(renderRichText(lexical('kept', '   ', ''))).toBe('<p>kept</p>');
  });
});
