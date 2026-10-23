import styles from './ScoreBadge.module.css';

interface ScoreBadgeProps {
  score: number;
  size?: 'lg' | 'sm';
  label?: string;
}

// Ring-gauge score badge. Server-safe (pure CSS, no client JS): the conic
// gradient fills via the --pct custom property, numerals are tabular mono.
export default function ScoreBadge({ score, size = 'lg', label }: ScoreBadgeProps) {
  const pct = Math.max(0, Math.min(100, Math.round(score * 10)));
  return (
    <div
      className={`${styles.badge} ${size === 'lg' ? styles.lg : styles.sm}`}
      role="img"
      aria-label={label ?? `Overall score ${score} out of 10`}
    >
      <div className={styles.ring} style={{ '--pct': pct } as React.CSSProperties}>
        <div className={styles.inner}>
          <span className={styles.scoreNum}>{score.toFixed(1)}</span>
          <span className={styles.scoreDen}>{size === 'lg' ? '/10' : ''}</span>
        </div>
      </div>
    </div>
  );
}
