// Shared deterministic formatting helpers (pure — safe in server and client
// code, unlike app/lib/reviews.ts which reads the filesystem).
//
// Month lists replace toLocaleDateString's runtime locale output, which differs
// between the build machine and the user's browser (different ICU tables) and
// silently breaks hydration whenever the affected subtree re-renders client-side.
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Format a validated "YYYY-MM-DD" review date deterministically. Date-only
 * strings parse as UTC midnight (per spec), so build and browser read the same
 * calendar day. Pass long=true for the review pages' "17 October 2026" style.
 */
export function formatDate(iso: string, long = false): string {
  const d = new Date(iso);
  const month = (long ? MONTHS_LONG : MONTHS_SHORT)[d.getUTCMonth()];
  return `${d.getUTCDate()} ${month} ${d.getUTCFullYear()}`;
}
