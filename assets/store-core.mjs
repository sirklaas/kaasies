export const FREE_SHIPPING_THRESHOLD = 6000;
export const SHIPPING_COST = 695;

export function addItem(cart, product) {
  const existing = cart.find(item => item.id === product.id);
  if (!existing) return [...cart, { ...product, quantity: 1 }];
  return cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
}

export function removeItem(cart, id) {
  return cart.filter(item => item.id !== id);
}

export function setQuantity(cart, id, quantity) {
  const safeQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
  if (safeQuantity === 0) return removeItem(cart, id);
  return cart.map(item => item.id === id ? { ...item, quantity: safeQuantity } : item);
}

export function cartCount(cart) {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotal(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function shippingCost(cart) {
  const subtotal = cartSubtotal(cart);
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export function formatEuro(cents) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}
