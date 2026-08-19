import { products } from './products';
import type { CatalogAdapter, Product } from './types';

export const localCatalogAdapter: CatalogAdapter = {
  async getActiveProducts(): Promise<readonly Product[]> {
    return products.filter((product) => product.active);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    return products.find((product) => product.slug === slug) ?? null;
  },
};

export function getActiveProducts(): Promise<readonly Product[]> {
  return localCatalogAdapter.getActiveProducts();
}

export function getProductBySlug(slug: string): Promise<Product | null> {
  return localCatalogAdapter.getProductBySlug(slug);
}
