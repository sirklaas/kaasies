import type { MetadataRoute } from 'next';
import { describe, expect, it } from 'vitest';

type Sitemap = () => Promise<MetadataRoute.Sitemap>;

const loadSitemap = async (): Promise<Sitemap | undefined> => {
  try {
    return (await import('@/app/' + 'sitemap')).default as Sitemap;
  } catch {
    return undefined;
  }
};

describe('public sitemap', () => {
  it('publishes every public route on the canonical production domain', async () => {
    const sitemap = await loadSitemap();

    expect(sitemap).toBeTypeOf('function');

    const entries = await sitemap?.();
    const urls = entries?.map((entry) => entry.url);

    expect(urls).toEqual(expect.arrayContaining([
      'https://kaasies.com/',
      'https://kaasies.com/shop',
      'https://kaasies.com/shop/jong',
      'https://kaasies.com/shop/belegen',
      'https://kaasies.com/shop/oud',
      'https://kaasies.com/manifest',
      'https://kaasies.com/makers',
      'https://kaasies.com/service',
      'https://kaasies.com/contact',
      'https://kaasies.com/verhalen',
      'https://kaasies.com/verhalen/geef-kaas-haar-tijd-terug',
      'https://kaasies.com/verhalen/breekbaar-is-een-compliment',
    ]));
    expect(urls).not.toContain('https://kaasies.com/verhalen/lees-de-achterkant');
    expect(urls).toHaveLength(12);
    expect(urls?.every((url) => url.startsWith('https://kaasies.com'))).toBe(true);
  });
});
