import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import HomePage from '@/app/page';
import ShopPage from '@/app/shop/page';

describe('catalog route content', () => {
  afterEach(cleanup);

  it('keeps the homepage editorial with three monthly favourites and a clear shop route', async () => {
    render(await HomePage());

    const productLinks = screen.getAllByRole('link', { name: /bekijk kaas/i });

    expect(screen.getByRole('heading', { name: 'Kaas waar we deze maand op vallen' })).toBeInTheDocument();
    expect(productLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/shop/jong',
      '/shop/belegen',
      '/shop/oud',
    ]);
    expect(screen.getByRole('link', { name: /watertandend verder/i })).toHaveAttribute('href', '/shop');
  });

  it('shows exactly the active catalog products in the shop', async () => {
    render(await ShopPage());

    const productLinks = screen.getAllByRole('link', { name: /bekijk kaas/i });

    expect(productLinks).toHaveLength(16);
    expect(productLinks.map((link) => link.getAttribute('href'))).toContain('/shop/minder-zout');
    expect(screen.getAllByText('Per 1 kg')).toHaveLength(16);
  });
});
