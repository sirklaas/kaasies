/**
 * Shape shared by storefront, back office and the future PocketBase adapter.
 * Prices are eurocents; every weight and inventory value is integer grams.
 */
export const CATALOG_CONTRACT_VERSION = 1;

export const EMPTY_CATALOG = Object.freeze({
  version: CATALOG_CONTRACT_VERSION,
  products: [],
  syncedAt: null,
});
