'use client';

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react';

import type { CheckoutErrors, CheckoutFields } from './types';
import { validateCheckout } from './validation';
import styles from './checkout.module.css';

const initialFields: CheckoutFields = {
  name: '',
  street: '',
  postalCode: '',
  city: '',
  phone: '',
  email: '',
  newsletter: false,
};

type FieldName = Exclude<keyof CheckoutFields, 'newsletter'>;

export function CheckoutForm() {
  const [fields, setFields] = useState<CheckoutFields>(initialFields);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [confirmation, setConfirmation] = useState('');
  const [focusRequest, setFocusRequest] = useState<{ field: FieldName } | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  const postalCodeRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!focusRequest) return;

    const refs = {
      name: nameRef,
      street: streetRef,
      postalCode: postalCodeRef,
      city: cityRef,
      phone: phoneRef,
      email: emailRef,
    };

    refs[focusRequest.field].current?.focus();
  }, [focusRequest]);

  const updateField = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked, name, type, value } = event.target;
    const fieldName = name as keyof CheckoutFields;
    const nextValue = type === 'checkbox' ? checked : value;

    setFields((currentFields) => ({ ...currentFields, [fieldName]: nextValue }));
    setConfirmation('');

    if (fieldName !== 'newsletter') {
      setErrors((currentErrors) => ({ ...currentErrors, [fieldName]: undefined }));
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateCheckout(fields);
    setErrors(nextErrors);
    setConfirmation('');

    const firstInvalidField = (Object.keys(nextErrors) as FieldName[])[0];
    if (firstInvalidField) {
      setFocusRequest({ field: firstInvalidField });
      return;
    }

    setConfirmation('Je gegevens zijn gecontroleerd. Betalen met Mollie activeren we in de volgende beveiligde stap.');
  };

  return (
    <form aria-labelledby="checkout-title" className={styles.checkout} noValidate onSubmit={submit}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Veilig verder, stap voor stap</p>
        <h1 id="checkout-title">Afrekenen</h1>
        <p>Controleer je bezorggegevens. In deze prototype-stap betaal je nog niet en versturen we niets.</p>
      </header>

      <fieldset className={styles.fieldset}>
        <legend>Bezorggegevens</legend>
        <p className={styles.requiredNote}><span aria-hidden="true">*</span> Verplicht veld</p>

        <div className={styles.fieldGrid}>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor="name">Naam</label>
            <input
              aria-describedby={errors.name ? 'name-error' : undefined}
              aria-invalid={Boolean(errors.name)}
              autoComplete="name"
              id="name"
              name="name"
              onChange={updateField}
              ref={nameRef}
              required
              type="text"
              value={fields.name}
            />
            {errors.name && <p className={styles.error} id="name-error">{errors.name}</p>}
          </div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor="street">Straat + huisnummer</label>
            <input
              aria-describedby={errors.street ? 'street-error' : undefined}
              aria-invalid={Boolean(errors.street)}
              autoComplete="street-address"
              id="street"
              name="street"
              onChange={updateField}
              ref={streetRef}
              required
              type="text"
              value={fields.street}
            />
            {errors.street && <p className={styles.error} id="street-error">{errors.street}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="postalCode">Postcode</label>
            <input
              aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
              aria-invalid={Boolean(errors.postalCode)}
              autoComplete="postal-code"
              id="postalCode"
              inputMode="text"
              name="postalCode"
              onChange={updateField}
              ref={postalCodeRef}
              required
              type="text"
              value={fields.postalCode}
            />
            {errors.postalCode && <p className={styles.error} id="postalCode-error">{errors.postalCode}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="city">Woonplaats</label>
            <input
              aria-describedby={errors.city ? 'city-error' : undefined}
              aria-invalid={Boolean(errors.city)}
              autoComplete="address-level2"
              id="city"
              name="city"
              onChange={updateField}
              ref={cityRef}
              required
              type="text"
              value={fields.city}
            />
            {errors.city && <p className={styles.error} id="city-error">{errors.city}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="phone">Telefoonnummer</label>
            <input
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              aria-invalid={Boolean(errors.phone)}
              autoComplete="tel"
              id="phone"
              inputMode="tel"
              name="phone"
              onChange={updateField}
              ref={phoneRef}
              required
              type="tel"
              value={fields.phone}
            />
            {errors.phone && <p className={styles.error} id="phone-error">{errors.phone}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">E-mailadres</label>
            <input
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              id="email"
              inputMode="email"
              name="email"
              onChange={updateField}
              ref={emailRef}
              required
              type="email"
              value={fields.email}
            />
            {errors.email && <p className={styles.error} id="email-error">{errors.email}</p>}
          </div>
        </div>
      </fieldset>

      <div className={styles.consent}>
        <input
          aria-describedby="newsletter-detail"
          checked={fields.newsletter}
          id="newsletter"
          name="newsletter"
          onChange={updateField}
          type="checkbox"
        />
        <div>
          <label htmlFor="newsletter">Ja, ik wil de nieuwsbrief ontvangen.</label>
          <p id="newsletter-detail">Optioneel. Je geeft alleen toestemming voor de nieuwsbrief.</p>
        </div>
      </div>

      <button className={styles.submit} type="submit">Gegevens controleren</button>
      {confirmation && <p className={styles.confirmation} role="status">{confirmation}</p>}
    </form>
  );
}
