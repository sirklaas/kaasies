import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteHeader } from '@/components/layout/SiteHeader';

describe('SiteHeader', () => {
  it('gives shoppers a labelled home link, primary navigation and cart route', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('link', { name: /kaasies, naar homepage/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('navigation', { name: /hoofdnavigatie/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /mandje/i })).toHaveAttribute('href', '/mandje');
  });
});
