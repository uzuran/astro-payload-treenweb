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

  it('uses a custom site name and skips the suffix when the title already contains it', () => {
    const meta = buildMeta({ title: 'FORMA — барбершоп', path: '/', siteName: 'FORMA' }, SITE);
    expect(meta.title).toBe('FORMA — барбершоп');
    expect(meta.og['og:site_name']).toBe('FORMA');
  });

  it('still appends a custom site name when absent from the title', () => {
    expect(buildMeta({ title: 'Услуги', path: '/s', siteName: 'FORMA' }, SITE).title).toBe(
      'Услуги · FORMA',
    );
  });

  it('emits og:locale only when a locale is given', () => {
    expect(buildMeta({ title: 'X', path: '/', locale: 'ru' }, SITE).og['og:locale']).toBe('ru');
    expect(buildMeta({ title: 'X', path: '/' }, SITE).og['og:locale']).toBeUndefined();
  });

  it('emits og:locale:alternate for the other locales, excluding the current one', () => {
    const meta = buildMeta(
      { title: 'X', path: '/', locale: 'ru', localeAlternates: ['ru', 'en', 'cs'] },
      SITE,
    );
    expect(meta.ogRepeatable).toEqual([
      ['og:locale:alternate', 'en'],
      ['og:locale:alternate', 'cs'],
    ]);
    expect(buildMeta({ title: 'X', path: '/' }, SITE).ogRepeatable).toEqual([]);
  });

  it('carries hreflang alternates through, defaulting to none', () => {
    expect(buildMeta({ title: 'X', path: '/' }, SITE).alternates).toEqual([]);
    const alts = [{ hreflang: 'en', href: 'https://x/en' }];
    expect(buildMeta({ title: 'X', path: '/', alternates: alts }, SITE).alternates).toEqual(alts);
  });
});
