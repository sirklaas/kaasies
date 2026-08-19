export type CheckoutFields = {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  newsletter: boolean;
};

export type CheckoutErrors = Partial<Record<Exclude<keyof CheckoutFields, 'newsletter'>, string>>;
