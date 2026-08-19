import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ORDER_STATUS,
  createOrderDraft,
  normalizeWeightGrams,
  transitionOrder,
  validateCustomer,
} from '../assets/pocketbase/domain.mjs';
import { getPocketBaseConfig } from '../assets/pocketbase/config.mjs';

const catalog = [
  {
    id: 'jong',
    active: true,
    variants: [
      { id: 'jong-500', weightGrams: 500, priceCents: 1295, stockGrams: 3000 },
      { id: 'jong-1000', weightGrams: 1000, priceCents: 2495, stockGrams: 2000 },
    ],
  },
];

test('normalizes kilograms to integer grams without floating point stock', () => {
  assert.equal(normalizeWeightGrams({ kilograms: 1.25 }), 1250);
  assert.equal(normalizeWeightGrams({ grams: 500 }), 500);
  assert.throws(() => normalizeWeightGrams({ kilograms: 0 }), /groter dan nul/i);
});

test('customer validation keeps newsletter consent explicit and requires checkout fields', () => {
  const result = validateCustomer({
    name: 'Ada Kaas',
    email: 'ada@example.nl',
    phone: '+31 6 12345678',
    street: 'Kaasstraat 1',
    postalCode: '1234 AB',
    city: 'Gouda',
    countryCode: 'NL',
  });

  assert.equal(result.valid, true);
  assert.equal(result.value.newsletterConsent, false);
  assert.match(result.value.newsletterConsentAt, /^$/);
  assert.equal(validateCustomer({ name: 'Ada' }).valid, false);
});

test('order draft snapshots price and weight and computes totals in cents', () => {
  const order = createOrderDraft({
    customerId: 'customer-1',
    items: [{ productId: 'jong', variantId: 'jong-500', quantity: 2 }],
    shippingCents: 695,
  }, catalog);

  assert.equal(order.status, ORDER_STATUS.DRAFT);
  assert.equal(order.lines[0].unitWeightGrams, 500);
  assert.equal(order.lines[0].unitPriceCents, 1295);
  assert.equal(order.subtotalCents, 2590);
  assert.equal(order.totalCents, 3285);
});

test('order draft rejects unavailable or insufficient stock', () => {
  assert.throws(() => createOrderDraft({
    customerId: 'customer-1',
    items: [{ productId: 'jong', variantId: 'jong-1000', quantity: 3 }],
    shippingCents: 0,
  }, catalog), /voorraad/i);
});

test('order status only follows the operational workflow', () => {
  const paid = transitionOrder({ status: ORDER_STATUS.PENDING_PAYMENT }, ORDER_STATUS.PAID);
  assert.equal(paid.status, ORDER_STATUS.PAID);
  assert.throws(
    () => transitionOrder({ status: ORDER_STATUS.DRAFT }, ORDER_STATUS.SHIPPED),
    /ongeldige statusovergang/i,
  );
});

test('browser config only exposes the public PocketBase URL', () => {
  assert.deepEqual(
    getPocketBaseConfig({ KAASIES_POCKETBASE_URL: 'https://pb.example.nl/' }),
    { url: 'https://pb.example.nl' },
  );
  assert.throws(() => getPocketBaseConfig({}), /KAASIES_POCKETBASE_URL/);
});
