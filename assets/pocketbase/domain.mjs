export const ORDER_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  PROCESSING: 'processing',
  READY_TO_SHIP: 'ready_to_ship',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
});

const transitions = Object.freeze({
  draft: ['pending_payment', 'cancelled'],
  pending_payment: ['paid', 'cancelled'],
  paid: ['processing', 'refunded'],
  processing: ['ready_to_ship', 'refunded'],
  ready_to_ship: ['shipped', 'refunded'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
});

export function normalizeWeightGrams({ grams, kilograms } = {}) {
  const value = grams ?? (kilograms == null ? NaN : Number(kilograms) * 1000);
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
    throw new Error('Gewicht moet groter dan nul zijn.');
  }
  const rounded = Math.round(Number(value));
  if (Math.abs(Number(value) - rounded) > Number.EPSILON) {
    throw new Error('Gewicht moet in hele grammen worden opgeslagen.');
  }
  return rounded;
}

export function validateCustomer(input = {}) {
  const required = ['name', 'email', 'phone', 'street', 'postalCode', 'city', 'countryCode'];
  const missing = required.filter(key => !String(input[key] ?? '').trim());
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input.email ?? '').trim());
  if (missing.length || !emailValid) {
    return { valid: false, errors: [...missing.map(key => `${key} is verplicht`), ...(!emailValid ? ['email is ongeldig'] : [])] };
  }
  const consent = input.newsletterConsent === true;
  return {
    valid: true,
    value: {
      name: String(input.name).trim(),
      email: String(input.email).trim().toLowerCase(),
      phone: String(input.phone).trim(),
      street: String(input.street).trim(),
      postalCode: String(input.postalCode).trim().toUpperCase(),
      city: String(input.city).trim(),
      countryCode: String(input.countryCode).trim().toUpperCase(),
      newsletterConsent: consent,
      newsletterConsentAt: consent ? String(input.newsletterConsentAt || new Date().toISOString()) : '',
    },
  };
}

export function createOrderDraft(input, catalog) {
  if (!String(input?.customerId ?? '').trim()) throw new Error('Klant is verplicht.');
  if (!Array.isArray(input.items) || input.items.length === 0) throw new Error('Bestelling heeft minimaal één orderregel nodig.');
  const lines = input.items.map(item => {
    const product = catalog.find(entry => entry.id === item.productId && entry.active !== false);
    const variant = product?.variants?.find(entry => entry.id === item.variantId && entry.active !== false);
    const quantity = Math.floor(Number(item.quantity));
    if (!product || !variant) throw new Error('Productvariant is niet beschikbaar.');
    if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Aantal moet groter dan nul zijn.');
    const requestedGrams = normalizeWeightGrams({ grams: variant.weightGrams }) * quantity;
    if (requestedGrams > variant.stockGrams) throw new Error('Onvoldoende voorraad voor deze variant.');
    return {
      productId: product.id,
      variantId: variant.id,
      quantity,
      unitWeightGrams: variant.weightGrams,
      unitPriceCents: variant.priceCents,
      lineTotalCents: variant.priceCents * quantity,
    };
  });
  const subtotalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const shippingCents = Math.max(0, Math.round(Number(input.shippingCents) || 0));
  return {
    customerId: input.customerId,
    status: ORDER_STATUS.DRAFT,
    currency: 'EUR',
    lines,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}

export function transitionOrder(order, nextStatus) {
  if (!transitions[order?.status]?.includes(nextStatus)) {
    throw new Error(`Ongeldige statusovergang: ${order?.status || 'onbekend'} → ${nextStatus}.`);
  }
  return { ...order, status: nextStatus };
}
