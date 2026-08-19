export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  maturation: string;
  tasteNotes: readonly string[];
  pricePerKgCents: number;
  stockGrams: number;
  allowedWeightsGrams: readonly (250 | 500 | 750 | 1000)[];
  image: { src: string; alt: string; width: number; height: number };
  active: boolean;
  seo: { title: string; description: string };
};

export interface CatalogAdapter {
  getActiveProducts(): Promise<readonly Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
}
