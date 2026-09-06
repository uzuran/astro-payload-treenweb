import { describe, expect, it } from 'vitest';

import { buildMeta } from './buildMeta';

const SITE = 'https://treenweb.example';

describe('buildMeta', () => {
  it('appends the site-name suffix once when a siteName is given', () => {
    expect(buildMeta({ title: 'About', path: '/about', siteName: 'treenweb' }, SITE).title).toBe(
      'About · treenweb',
    );
    expect(
      buildMeta({ title: 'About · treenweb', path: '/about', siteName: 'treenweb' }, SITE).title,
    ).toBe('About · treenweb');
  });

  it('emits no suffix and no og:site_name when siteName is omitted', () => {
    const meta = buildMeta({ title: 'About', path: '/about' }, SITE);
    expect(meta.title).toBe('About');
    expect(meta.og['og:site_name']).toBeUndefined();
  });

  it('applies a titleTemplate with {page}/{site} tokens', () => {
    expect(
      buildMeta(
        { title: 'Услуги', path: '/s', siteName: 'FORMA', titleTemplate: '{page} — {site}' },
        SITE,
      ).title,
    ).toBe('Услуги — FORMA');
  });

  it('builds an absolute canonical URL from the path', () => {
    expect(buildMeta({ title: 'X', path: '/blog/post' }, SITE).canonical).toBe(
      'https://treenweb.example/blog/post',
    );
  });

  it('leaves description empty and drops the og/twitter tags when none is supplied', () => {
    const meta = buildMeta({ title: 'X', path: '/' }, SITE);
    expect(meta.description).toBe('');
    expect(meta.og['og:description']).toBeUndefined();
    expect(meta.twitter['twitter:description']).toBeUndefined();
  });

  it('carries a supplied description into og + twitter', () => {
    const meta = buildMeta({ title: 'X', path: '/', description: 'Hello.' }, SITE);
    expect(meta.description).toBe('Hello.');
    expect(meta.og['og:description']).toBe('Hello.');
    expect(meta.twitter['twitter:description']).toBe('Hello.');
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
