import type { Metadata } from 'next';

import { CheckoutForm } from '@/components/checkout/CheckoutForm';

export const metadata: Metadata = {
  title: 'Bestelling afronden',
  description: 'Rond je Kaasies-bestelling af met je gegevens en bezorgvoorkeuren.',
  alternates: { canonical: '/checkout' },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
