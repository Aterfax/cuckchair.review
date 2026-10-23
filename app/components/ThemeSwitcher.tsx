'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ThemeSwitcher.module.css';
import { VIGIL_EVENT, VIGIL_KEY, isVigilUnlocked, unlockVigil } from '../lib/vigilUnlock';

type Theme = 'editorial' | 'brutalist' | 'saas';

const THEMES: { id: Theme; label: string }[] = [
  { id: 'editorial', label: 'Editorial' },
  { id: 'brutalist', label: 'Brutalist' },
  { id: 'saas', label: 'SaaS' },
];

const ACCENTS: { id: string; label: string; dot: string }[] = [
  { id: 'amber', label: 'Amber', dot: '#fbbf24' },
  { id: 'blue', label: 'Blue', dot: '#60a5fa' },
  { id: 'blue-violet', label: 'Blue-violet', dot: 'linear-gradient(135deg, #a78bfa, #60a5fa)' },
  { id: 'mint', label: 'Mint', dot: '#34d399' },
];

/** Konami: ↑ ↑ ↓ ↓ ← → ← → B A, as KeyboardEvent.code values. */
const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA',
];
const KONAMI_TEXT = KONAMI.join('>');

// Merge-and-tell switcher: two compact groups. State mirrors attributes that
// the pre-paint script in app/layout.tsx has already applied to <html>, so
// the visual state is authoritative on the element, not React.
//
// The selector is hidden behind "the vigil" (vigilUnlock.ts): it renders
// nothing until a visitor unlocks it with the Konami code or a long-press
// on the logo. Unlocking persists, so saved themes keep applying via the
// pre-paint script even while the control surface stays absent.
export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('editorial');
  const [accent, setAccent] = useState('amber');
  const [unlocked, setUnlocked] = useState(false);
  const [toast, setToast] = useState(false);
  const unlockedRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);
  const bufferRef = useRef<string[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    const t = (root.dataset.theme as Theme) || 'editorial';
    const a = root.dataset.accent || 'amber';
    setTheme(t);
    setAccent(a);
  }, []);

  // Reveal for visitors who unlocked before (persisted flag), react when the
  // logo long-press fires this tab, and follow unlocks made in other tabs.
  useEffect(() => {
    const reveal = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      setUnlocked(true);
      setToast(true);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => setToast(false), 4000);
    };

    if (isVigilUnlocked()) {
      unlockedRef.current = true;
      setUnlocked(true);
    }

    const onKey = (event: KeyboardEvent) => {
      if (unlockedRef.current) return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      bufferRef.current.push(event.code);
      bufferRef.current = bufferRef.current.slice(-KONAMI.length);
      if (bufferRef.current.join('>') === KONAMI_TEXT) {
        bufferRef.current = [];
        unlockVigil();
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === VIGIL_KEY && event.newValue === '1') reveal();
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener(VIGIL_EVENT, reveal);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(VIGIL_EVENT, reveal);
      window.removeEventListener('storage', onStorage);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  function apply(next: { theme?: Theme; accent?: string }) {
    const root = document.documentElement;
    if (next.theme) {
      root.dataset.theme = next.theme;
      setTheme(next.theme);
      try {
        localStorage.setItem('ccr.theme', next.theme);
      } catch {}
    }
    if (next.accent) {
      root.dataset.accent = next.accent;
      setAccent(next.accent);
      try {
        localStorage.setItem('ccr.accent', next.accent);
      } catch {}
    }
  }

  if (!unlocked) return null;

  return (
    <div className={`${styles.switcher} ${styles.unlocked}`} role="group" aria-label="Theme">
      <div className={styles.group} aria-label="Vibe preset">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={theme === t.id ? styles.chipActive : styles.chip}
            aria-pressed={theme === t.id}
            onClick={() => apply({ theme: t.id })}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={styles.group} aria-label="Accent color">
        {ACCENTS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={accent === a.id ? styles.swatchActive : styles.swatch}
            style={{ background: a.dot }}
            aria-label={`${a.label} color`}
            aria-pressed={accent === a.id}
            onClick={() => apply({ accent: a.id })}
          />
        ))}
      </div>
      {toast && <span className={styles.vigilToast} role="status">🎲 Vigil unlocked — themes at will</span>}
    </div>
  );
}
