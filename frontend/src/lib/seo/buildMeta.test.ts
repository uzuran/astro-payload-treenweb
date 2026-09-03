import { describe, expect, it } from 'vitest';

import { buildMeta } from './buildMeta';

const SITE = 'https://treenweb.example';

describe('buildMeta', () => {
  it('appends the site-name suffix once', () => {
    expect(buildMeta({ title: 'About', path: '/about' }, SITE).title).toBe('About · treenweb');
    expect(buildMeta({ title: 'About · treenweb', path: '/about' }, SITE).title).toBe(
      'About · treenweb',
    );
  });

  it('builds an absolute canonical URL from the path', () => {
    expect(buildMeta({ title: 'X', path: '/blog/post' }, SITE).canonical).toBe(
      'https://treenweb.example/blog/post',
    );
  });

  it('falls back to the default description', () => {
    expect(buildMeta({ title: 'X', path: '/' }, SITE).description).toBe(
      'Secure, SEO-first web platform.',
    );
  });

  it('emits noindex robots when requested', () => {
    expect(buildMeta({ title: 'X', path: '/', noindex: true }, SITE).robots).toBe(
      'noindex, nofollow',
    );
    expect(buildMeta({ title: 'X', path: '/' }, SITE).robots).toBe('index, follow');
  });

  it('resolves relative images against the site and sets large twitter card', () => {
    const meta = buildMeta({ title: 'X', path: '/', image: '/og/x.png' }, SITE);
    expect(meta.og['og:image']).toBe('https://treenweb.example/og/x.png');
    expect(meta.twitter['twitter:card']).toBe('summary_large_image');
  });

  it('uses a plain summary card with no image', () => {
    expect(buildMeta({ title: 'X', path: '/' }, SITE).twitter['twitter:card']).toBe('summary');
  });

  it('carries og:type through', () => {
    expect(buildMeta({ title: 'X', path: '/p', type: 'article' }, SITE).og['og:type']).toBe(
      'article',
    );
  });
});
