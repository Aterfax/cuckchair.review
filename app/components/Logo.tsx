'use client';

import Link from 'next/link';
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { isVigilUnlocked, unlockVigil } from '../lib/vigilUnlock';
import styles from './Logo.module.css';

const PRESS_MS = 600;

// This header logo is the identical artwork as app/icon.svg (the favicon's
// plate mark) so the logo and favicon match 1:1 — keep the two in sync.
//
// Third duty: holding it for PRESS_MS is the touch path into "the vigil"
// (the hidden theme selector). The keyboard path lives in ThemeSwitcher.
export default function Logo() {
  const armRef = useRef<number | null>(null);
  const holdRef = useRef<{ x: number; y: number } | null>(null);

  const clearArm = () => {
    if (armRef.current) {
      window.clearTimeout(armRef.current);
      armRef.current = null;
    }
  };

  useEffect(() => clearArm, []);

  function onPointerDown(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (isVigilUnlocked()) return;
    holdRef.current = { x: event.clientX, y: event.clientY };
    clearArm();
    armRef.current = window.setTimeout(() => {
      armRef.current = null;
      unlockVigil();
    }, PRESS_MS);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLAnchorElement>) {
    // A holding finger that scrolls away is not a deliberate press: cancel
    // once the pointer drifts more than ~10px from where the hold started.
    const start = holdRef.current;
    if (armRef.current && start) {
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (dx * dx + dy * dy > 100) clearArm();
    }
  }

  return (
    <Link
      href="/"
      className={styles.logo}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={clearArm}
      onPointerCancel={clearArm}
      onPointerLeave={clearArm}
      onContextMenu={(event) => {
        // Only during an armed hold: keep the native media menu from
        // intercepting the long-press; normal right-clicks stay untouched.
        if (armRef.current) event.preventDefault();
      }}
    >
      <svg
        className={styles.logoIcon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        {/* Plate */}
        <rect width="32" height="32" rx="7" fill="#141b2d" />
        <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" fill="none" stroke="#3a4a66" />
        {/* Backrest */}
        <rect x="8.5" y="5" width="15" height="12" rx="4" fill="url(#logoGrad)" />
        {/* Seat cushion */}
        <rect x="9.5" y="17" width="13" height="5" rx="2.5" fill="#475569" />
        {/* Armrests */}
        <rect x="5" y="12" width="5.5" height="10" rx="2.75" fill="#334155" />
        <rect x="21.5" y="12" width="5.5" height="10" rx="2.75" fill="#334155" />
        {/* Splayed legs */}
        <path d="M7 22 L6.5 26.5 M25 22 L25.5 26.5" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" />
        {/* Glowing phone on the cushion */}
        <rect x="14.7" y="19" width="2.6" height="3.2" rx="0.8" fill="#22d3ee" />
      </svg>
      <span className={styles.logoText}>cuckchair<span className={styles.logoDot}>.</span>review</span>
    </Link>
  );
}
