import Link from 'next/link';

import { BrandLogo } from '@/components/brand/BrandLogo';

import styles from './layout.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <Link aria-label="Kaasies, naar homepage" className={styles.footerLogoLink} href="/">
          <BrandLogo className={styles.footerLogo} />
        </Link>

        <p className={styles.footerStatement}>Geen palmolie. Geen shortcuts. Wel stukken waar je van blijft snijden.</p>

        <nav aria-label="Voettekstnavigatie" className={styles.footerNav}>
          <Link href="/service">Service</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/manifest">Ons manifest</Link>
        </nav>
      </div>
    </footer>
  );
}
