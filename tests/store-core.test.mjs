import test from 'node:test';
import assert from 'node:assert/strict';
import { addItem, removeItem, setQuantity, cartCount, cartSubtotal, shippingCost } from '../assets/store-core.mjs';

const young = { id: 'frisse-dwarsligger', name: 'De frisse dwarsligger', price: 895, image: 'Stompetoren_Jong_Belegen-1-aspect-ratio-956-647.jpg' };

test('adding the same product increments its quantity', () => {
  const once = addItem([], young);
  const twice = addItem(once, young);
  assert.equal(twice.length, 1);
  assert.equal(twice[0].quantity, 2);
  assert.equal(cartCount(twice), 2);
});

test('quantity and subtotal calculations use integer cents', () => {
  const cart = setQuantity(addItem([], young), young.id, 3);
  assert.equal(cartSubtotal(cart), 2685);
  assert.equal(shippingCost(cart), 695);
});

test('shipping is free from sixty euros', () => {
  const cart = [{ ...young, quantity: 7 }];
  assert.equal(cartSubtotal(cart), 6265);
  assert.equal(shippingCost(cart), 0);
});

test('zero quantity and explicit removal both remove a product', () => {
  const cart = addItem([], young);
  assert.deepEqual(setQuantity(cart, young.id, 0), []);
  assert.deepEqual(removeItem(cart, young.id), []);
});
