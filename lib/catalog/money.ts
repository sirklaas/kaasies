function assertInteger(value: number, label: string): void {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${label} must be an integer.`);
  }
}

export function formatEuros(cents: number): string {
  assertInteger(cents, 'cents');

  const sign = cents < 0 ? '-' : '';
  const absoluteCents = Math.abs(cents);
  const euros = Math.floor(absoluteCents / 100);
  const remainingCents = String(absoluteCents % 100).padStart(2, '0');

  return `${sign}€\u00a0${euros},${remainingCents}`;
}

export function priceForWeight(pricePerKgCents: number, weightGrams: number): number {
  assertInteger(pricePerKgCents, 'pricePerKgCents');
  assertInteger(weightGrams, 'weightGrams');

  if (pricePerKgCents < 0 || weightGrams < 0) {
    throw new RangeError('Price and weight must not be negative.');
  }

  return Math.round((pricePerKgCents * weightGrams) / 1000);
}
