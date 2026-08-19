import type { Metadata } from 'next';

import { CartView } from '@/components/cart/CartView';

export const metadata: Metadata = {
  title: 'Je mandje',
  description: 'Bekijk de gekozen Kaasies-kazen en pas je bestelling aan voordat je verdergaat.',
  alternates: { canonical: '/mandje' },
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartView />;
}
