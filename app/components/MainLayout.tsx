import React from 'react';
import styles from './MainLayout.module.css';
import Header from './Header';
import ParallaxBackground from './ParallaxBackground';

export default function MainLayout({ children }: {children: React.ReactNode}) {
  return (
    <div className={styles.wrapper}>
      <ParallaxBackground />
      <Header />
      <main className={styles.main} id="main-content">{children}</main>
      <footer className={styles.footer}>
        <p className={styles.siteTagline}>
          cuckchair.review &bull; Independent reviews of the whole setup. Unobstructed perspectives.
        </p>
        <p className={styles.footerCopy}>&copy; 2026</p>
      </footer>
    </div>
  );
}
