import type { Metadata, MetadataRoute } from 'next';
import { describe, expect, it } from 'vitest';

type Sitemap = () => Promise<MetadataRoute.Sitemap>;

const loadSitemap = async (): Promise<Sitemap | undefined> => {
  try {
    return (await import('@/app/' + 'sitemap')).default as Sitemap;
  } catch {
    return undefined;
  }
};

const pageMetadataLoaders = {
  mandje: () => import('@/app/mandje/page'),
  checkout: () => import('@/app/checkout/page'),
};

const loadPageMetadata = async (segment: keyof typeof pageMetadataLoaders): Promise<Metadata | undefined> => {
  return (await pageMetadataLoaders[segment]()).metadata as Metadata | undefined;
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
      'https://kaasies.com/verhalen/soms-is-kaas-geen-kaas',
      'https://kaasies.com/verhalen/geef-kaas-haar-tijd-terug',
      'https://kaasies.com/verhalen/breekbaar-is-een-compliment',
    ]));
    expect(urls).not.toContain('https://kaasies.com/verhalen/lees-de-achterkant');
    expect(urls).not.toContain('https://kaasies.com/mandje');
    expect(urls).not.toContain('https://kaasies.com/checkout');
    expect(urls).toHaveLength(26);
    expect(urls?.every((url) => url.startsWith('https://kaasies.com'))).toBe(true);
  });
});

describe('transactional route metadata', () => {
  it('keeps cart and checkout canonical but out of search results', async () => {
    const [cart, checkout] = await Promise.all([
      loadPageMetadata('mandje'),
      loadPageMetadata('checkout'),
    ]);

    expect(cart).toMatchObject({
      title: 'Je mandje',
      description: 'Bekijk de gekozen Kaasies-kazen en pas je bestelling aan voordat je verdergaat.',
      alternates: { canonical: '/mandje' },
      robots: { index: false, follow: false },
    });
    expect(checkout).toMatchObject({
      title: 'Bestelling afronden',
      description: 'Rond je Kaasies-bestelling af met je gegevens en bezorgvoorkeuren.',
      alternates: { canonical: '/checkout' },
      robots: { index: false, follow: false },
    });
  });
});
