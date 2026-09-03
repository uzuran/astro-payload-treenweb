/**
 * PLACEHOLDER renderer for Payload Lexical content.
 *
 * Step 7 replaces this with `@treenweb/richtext` (strict node allowlist +
 * sanitisation). Until then this is deliberately minimal: it extracts plain
 * text, HTML-escapes it, and wraps each top-level block in a <p>. It never
 * emits raw/attacker-controlled HTML.
 */

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

interface LexicalNode {
  type?: string;
  text?: string;
  children?: LexicalNode[];
}

const collectText = (node: LexicalNode | undefined): string => {
  if (!node) return '';
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.children)) return node.children.map(collectText).join('');
  return '';
};

export function renderRichText(content: unknown): string {
  const root = (content as { root?: LexicalNode } | null | undefined)?.root;
  if (!root || !Array.isArray(root.children)) return '';

  return root.children
    .map((block) => {
      const text = collectText(block).trim();
      return text ? `<p>${escapeHtml(text)}</p>` : '';
    })
    .filter(Boolean)
    .join('\n');
}
