import { describe, expect, it } from 'vitest';

import { validateCheckout } from '@/components/checkout/validation';

const validFields = {
  name: 'Sanne de Vries',
  street: 'Kaasstraat 12',
  postalCode: '1234 AB',
  city: 'Alkmaar',
  phone: '+31 6 12345678',
  email: 'sanne@example.nl',
  newsletter: false,
};

describe('validateCheckout', () => {
  it('accepts complete delivery details without newsletter consent', () => {
    expect(validateCheckout(validFields)).toEqual({});
  });

  it('explains when an email address cannot be used to contact the buyer', () => {
    expect(validateCheckout({ ...validFields, email: 'fout' })).toMatchObject({
      email: 'Vul een geldig e-mailadres in.',
    });
  });

  it('asks for the missing postal code', () => {
    expect(validateCheckout({ ...validFields, postalCode: '' })).toMatchObject({
      postalCode: 'Vul je postcode in.',
    });
  });

  it('identifies every required delivery field that is empty', () => {
    expect(validateCheckout({
      ...validFields,
      name: ' ',
      street: '',
      postalCode: ' ',
      city: '',
      phone: ' ',
      email: '',
    })).toEqual({
      name: 'Vul je naam in.',
      street: 'Vul je straat en huisnummer in.',
      postalCode: 'Vul je postcode in.',
      city: 'Vul je woonplaats in.',
      phone: 'Vul je telefoonnummer in.',
      email: 'Vul je e-mailadres in.',
    });
  });
});
