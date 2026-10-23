/**
 * The vigil: the header's theme selector stays hidden until a visitor
 * performs one of the two hidden unlocks — the Konami code or a long-press
 * on the header logo. Once unlocked, the flag persists on the device
 * (localStorage) and the selector stays available everywhere.
 *
 * ThemeSwitcher owns the reveal; this module just shares the flag between
 * the trigger (Logo) and the listener (ThemeSwitcher) without circular
 * imports. Unlocking dispatches a window event so the same tab reveals
 * immediately; a 'storage' event covers other tabs.
 */

export const VIGIL_KEY = 'ccr.konami';

/** Window event name ThemeSwitcher listens for to flip open. */
export const VIGIL_EVENT = 'ccr.vigil-unlocked';

export function isVigilUnlocked(): boolean {
  try {
    return localStorage.getItem(VIGIL_KEY) === '1';
  } catch {
    return false;
  }
}

export function unlockVigil(): void {
  try {
    localStorage.setItem(VIGIL_KEY, '1');
  } catch {
    // Private-browsing storage errors: the flag simply will not persist.
  }
  window.dispatchEvent(new Event(VIGIL_EVENT));
}
