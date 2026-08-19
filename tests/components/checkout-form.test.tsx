import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CheckoutForm } from '@/components/checkout/CheckoutForm';

afterEach(() => {
  cleanup();
});

const completeFields = () => {
  fireEvent.change(screen.getByLabelText('Naam'), { target: { value: 'Sanne de Vries' } });
  fireEvent.change(screen.getByLabelText('Straat + huisnummer'), { target: { value: 'Kaasstraat 12' } });
  fireEvent.change(screen.getByLabelText('Postcode'), { target: { value: '1234 AB' } });
  fireEvent.change(screen.getByLabelText('Woonplaats'), { target: { value: 'Alkmaar' } });
  fireEvent.change(screen.getByLabelText('Telefoonnummer'), { target: { value: '+31 6 12345678' } });
  fireEvent.change(screen.getByLabelText('E-mailadres'), { target: { value: 'sanne@example.nl' } });
};

describe('CheckoutForm', () => {
  it('links clear errors to their fields, focuses the first invalid field, and keeps typed values', () => {
    render(<CheckoutForm />);

    const email = screen.getByLabelText('E-mailadres');
    fireEvent.change(email, { target: { value: 'sanne@voorbeeld.nl' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gegevens controleren' }));

    expect(screen.getByLabelText('Naam')).toHaveFocus();
    expect(email).toHaveValue('sanne@voorbeeld.nl');
    expect(screen.getByText('Vul je naam in.')).toHaveAttribute('id', 'name-error');
    expect(screen.getByLabelText('Naam')).toHaveAttribute('aria-describedby', 'name-error');
  });

  it('starts with optional newsletter consent unchecked', () => {
    render(<CheckoutForm />);

    expect(screen.getByRole('checkbox', { name: /nieuwsbrief/i })).not.toBeChecked();
  });

  it('confirms the local prototype step only after valid details are entered', () => {
    render(<CheckoutForm />);

    completeFields();
    fireEvent.click(screen.getByRole('button', { name: 'Gegevens controleren' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Je gegevens zijn gecontroleerd. Betalen met Mollie activeren we in de volgende beveiligde stap.',
    );
  });
});
