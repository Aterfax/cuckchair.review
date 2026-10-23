'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import Logo from './Logo';
import ThemeSwitcher from './ThemeSwitcher';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/reviews/', label: 'Directory' },
  { href: '/compare/', label: 'Compare' },
  { href: '/methodology/', label: 'Methodology' },
  { href: '/disclosures/', label: 'Disclosures' },
  { href: '/games/', label: 'Games' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href);
}

export default function Header() {
  const pathname = usePathname() ?? '/';

  return (
    <header className={styles.header}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <Logo />
      <div className={styles.headerRight}>
        <ThemeSwitcher />
        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? styles.navLinkActive : styles.navLink}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
