import Link from 'next/link';

import { BrandLogo } from '@/components/brand/BrandLogo';

import styles from './layout.module.css';

const primaryLinks = [
  { href: '/shop', label: 'Kazen' },
  { href: '/manifest', label: 'Waarom echt?' },
  { href: '/makers', label: 'De makers' },
  { href: '/verhalen', label: 'Verhalen' },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link aria-label="Kaasies, naar homepage" className={styles.logoLink} href="/">
          <BrandLogo className={styles.logo} priority />
        </Link>

        <nav aria-label="Hoofdnavigatie" className={styles.primaryNav}>
          {primaryLinks.map((link) => (
            <Link className={styles.navLink} href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <Link aria-label="Mandje" className={styles.cartLink} href="/mandje">
          <span aria-hidden="true">Mandje</span>
          <span aria-hidden="true" className={styles.cartMark}>→</span>
        </Link>
      </div>
    </header>
  );
}
