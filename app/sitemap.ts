import type { MetadataRoute } from 'next';

import { getActiveProducts } from '@/lib/catalog/local-adapter';
import { getCampaigns, getStaticRoutes } from '@/lib/content/local-adapter';
import { siteConfig } from '@/lib/site-config';

const canonicalUrl = (path: string): string => new URL(path, siteConfig.origin).toString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [staticRoutes, products, campaigns] = await Promise.all([
    getStaticRoutes(),
    getActiveProducts(),
    getCampaigns(),
  ]);

  return [
    ...staticRoutes,
    ...products.map((product) => `/shop/${product.slug}`),
    ...campaigns.map((campaign) => `/verhalen/${campaign.slug}`),
  ].map((path) => ({ url: canonicalUrl(path) }));
}
