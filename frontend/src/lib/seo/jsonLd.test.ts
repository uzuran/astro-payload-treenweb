import { describe, expect, it } from 'vitest';

import { articleJsonLd, breadcrumbJsonLd, serializeJsonLd, webPageJsonLd } from './jsonLd';

describe('jsonLd builders', () => {
  it('builds a WebPage node', () => {
    expect(webPageJsonLd({ title: 'T', description: 'D', url: 'https://x/' })).toMatchObject({
      '@type': 'WebPage',
      name: 'T',
      url: 'https://x/',
    });
  });

  it('omits article dates when absent', () => {
    const node = articleJsonLd({ title: 'T', description: 'D', url: 'https://x/p' });
    expect(node).not.toHaveProperty('datePublished');
    const withDate = articleJsonLd({
      title: 'T',
      description: 'D',
      url: 'https://x/p',
      datePublished: '2026-01-01',
    });
    expect(withDate.datePublished).toBe('2026-01-01');
  });

  it('numbers breadcrumb positions from 1', () => {
    const node = breadcrumbJsonLd([
      { name: 'Home', url: 'https://x/' },
      { name: 'Blog', url: 'https://x/blog' },
    ]);
    const items = node.itemListElement as { position: number }[];
    expect(items.map((i) => i.position)).toEqual([1, 2]);
  });

  it('escapes "<" so the payload cannot break out of a <script> tag', () => {
    expect(serializeJsonLd({ x: '</script><script>alert(1)</script>' })).not.toContain('</script>');
    expect(serializeJsonLd({ x: '<b>' })).toContain('\\u003c');
  });
});
