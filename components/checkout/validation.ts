import type { CheckoutErrors, CheckoutFields } from './types';

const isBlank = (value: string) => value.trim().length === 0;
const isEmailAddress = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function validateCheckout(fields: CheckoutFields): CheckoutErrors {
  const errors: CheckoutErrors = {};

  if (isBlank(fields.name)) errors.name = 'Vul je naam in.';
  if (isBlank(fields.street)) errors.street = 'Vul je straat en huisnummer in.';
  if (isBlank(fields.postalCode)) errors.postalCode = 'Vul je postcode in.';
  if (isBlank(fields.city)) errors.city = 'Vul je woonplaats in.';
  if (isBlank(fields.phone)) errors.phone = 'Vul je telefoonnummer in.';

  if (isBlank(fields.email)) {
    errors.email = 'Vul je e-mailadres in.';
  } else if (!isEmailAddress(fields.email)) {
    errors.email = 'Vul een geldig e-mailadres in.';
  }

  return errors;
}
