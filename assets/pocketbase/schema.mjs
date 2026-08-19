/**
 * Declarative PocketBase contract for Kaasies.
 *
 * This file does not connect to PocketBase and contains no credentials.
 * `null` rules mean server-only. Products are the only public records;
 * variants, inventory, customers and orders must pass through our server.
 */
export const KAASIES_COLLECTIONS = Object.freeze([
  {
    name: 'kaasies_products',
    type: 'base',
    rules: { listRule: 'active = true', viewRule: 'active = true', createRule: null, updateRule: null, deleteRule: null },
    fields: [
      ['slug', 'text', { required: true, unique: true, min: 2, max: 100 }],
      ['name', 'text', { required: true, max: 160 }],
      ['shortDescription', 'text', { required: true, max: 320 }],
      ['description', 'editor', { required: false }],
      ['ageLabel', 'text', { required: false, max: 80 }],
      ['milkType', 'select', { required: true, values: ['cow', 'goat', 'sheep', 'buffalo'] }],
      ['image', 'file', { required: false, maxSelect: 1, maxSize: 8_000_000, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] }],
      ['active', 'bool', { required: true }],
      ['sortOrder', 'number', { required: true, min: 0, onlyInt: true }],
      ['seoTitle', 'text', { required: false, max: 70 }],
      ['seoDescription', 'text', { required: false, max: 170 }],
    ],
    indexes: ['CREATE UNIQUE INDEX idx_kaasies_products_slug ON kaasies_products (slug)'],
  },
  {
    name: 'kaasies_product_variants',
    type: 'base',
    rules: { listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null },
    fields: [
      ['product', 'relation', { required: true, collection: 'kaasies_products', maxSelect: 1, cascadeDelete: true }],
      ['sku', 'text', { required: true, unique: true, min: 2, max: 80 }],
      ['label', 'text', { required: true, max: 80 }],
      ['weightGrams', 'number', { required: true, min: 1, onlyInt: true }],
      ['priceCents', 'number', { required: true, min: 0, onlyInt: true }],
      ['active', 'bool', { required: true }],
      ['sortOrder', 'number', { required: true, min: 0, onlyInt: true }],
    ],
    indexes: ['CREATE UNIQUE INDEX idx_kaasies_variants_sku ON kaasies_product_variants (sku)'],
  },
  {
    name: 'kaasies_inventory',
    type: 'base',
    rules: { listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null },
    fields: [
      ['variant', 'relation', { required: true, collection: 'kaasies_product_variants', maxSelect: 1, cascadeDelete: true }],
      ['stockGrams', 'number', { required: true, min: 0, onlyInt: true }],
      ['reservedGrams', 'number', { required: true, min: 0, onlyInt: true }],
      ['reorderAtGrams', 'number', { required: true, min: 0, onlyInt: true }],
      ['updatedBy', 'text', { required: false, max: 120 }],
    ],
    indexes: ['CREATE UNIQUE INDEX idx_kaasies_inventory_variant ON kaasies_inventory (variant)'],
  },
  {
    name: 'kaasies_customers',
    type: 'base',
    rules: { listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null },
    fields: [
      ['email', 'email', { required: true }],
      ['name', 'text', { required: true, max: 160 }],
      ['phone', 'text', { required: true, max: 40 }],
      ['street', 'text', { required: true, max: 180 }],
      ['postalCode', 'text', { required: true, max: 20 }],
      ['city', 'text', { required: true, max: 120 }],
      ['countryCode', 'text', { required: true, min: 2, max: 2 }],
      ['newsletterConsent', 'bool', { required: true }],
      ['newsletterConsentAt', 'date', { required: false }],
    ],
    indexes: ['CREATE INDEX idx_kaasies_customers_email ON kaasies_customers (email)'],
  },
  {
    name: 'kaasies_orders',
    type: 'base',
    rules: { listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null },
    fields: [
      ['orderNumber', 'text', { required: true, unique: true, max: 40 }],
      ['customer', 'relation', { required: true, collection: 'kaasies_customers', maxSelect: 1, cascadeDelete: false }],
      ['status', 'select', { required: true, values: ['draft', 'pending_payment', 'paid', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled', 'refunded'] }],
      ['currency', 'select', { required: true, values: ['EUR'] }],
      ['subtotalCents', 'number', { required: true, min: 0, onlyInt: true }],
      ['shippingCents', 'number', { required: true, min: 0, onlyInt: true }],
      ['totalCents', 'number', { required: true, min: 0, onlyInt: true }],
      ['paymentProvider', 'select', { required: false, values: ['mollie'] }],
      ['paymentReference', 'text', { required: false, max: 120 }],
      ['trackingCode', 'text', { required: false, max: 120 }],
      ['paidAt', 'date', { required: false }],
      ['shippedAt', 'date', { required: false }],
    ],
    indexes: ['CREATE UNIQUE INDEX idx_kaasies_orders_number ON kaasies_orders (orderNumber)'],
  },
  {
    name: 'kaasies_order_lines',
    type: 'base',
    rules: { listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null },
    fields: [
      ['order', 'relation', { required: true, collection: 'kaasies_orders', maxSelect: 1, cascadeDelete: true }],
      ['product', 'relation', { required: true, collection: 'kaasies_products', maxSelect: 1, cascadeDelete: false }],
      ['variant', 'relation', { required: true, collection: 'kaasies_product_variants', maxSelect: 1, cascadeDelete: false }],
      ['productName', 'text', { required: true, max: 160 }],
      ['sku', 'text', { required: true, max: 80 }],
      ['quantity', 'number', { required: true, min: 1, onlyInt: true }],
      ['unitWeightGrams', 'number', { required: true, min: 1, onlyInt: true }],
      ['unitPriceCents', 'number', { required: true, min: 0, onlyInt: true }],
      ['lineTotalCents', 'number', { required: true, min: 0, onlyInt: true }],
    ],
  },
  {
    name: 'kaasies_workflow_events',
    type: 'base',
    rules: { listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null },
    fields: [
      ['order', 'relation', { required: true, collection: 'kaasies_orders', maxSelect: 1, cascadeDelete: true }],
      ['fromStatus', 'text', { required: false, max: 40 }],
      ['toStatus', 'text', { required: true, max: 40 }],
      ['source', 'select', { required: true, values: ['checkout', 'mollie_webhook', 'backoffice', 'fulfilment', 'system'] }],
      ['note', 'text', { required: false, max: 500 }],
      ['idempotencyKey', 'text', { required: true, unique: true, max: 160 }],
      ['occurredAt', 'date', { required: true }],
    ],
    indexes: ['CREATE UNIQUE INDEX idx_kaasies_workflow_idempotency ON kaasies_workflow_events (idempotencyKey)'],
  },
]);

export const KAASIES_COLLECTION_ORDER = Object.freeze(KAASIES_COLLECTIONS.map(collection => collection.name));
