import Link from 'next/link';

import styles from './methodology.module.css';
import { METRICS } from '../lib/reviews';

export const metadata = {
  title: 'Scoring methodology | cuckchair.review',
  description:
    'How cuckchair.review scores the whole setup — chair, room, and position: weighted metric ratings, the overall score formula, and editorial standards.',
  alternates: { canonical: 'https://cuckchair.review/methodology/' },
};

export default function Methodology() {
  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">EDITORIAL METHODOLOGY</p>
        <h1>How we score a setup</h1>
        <p className="intro">
          Every review scores the whole setup the same way, so you can compare
          one chair-in-its-room against another. Metric scores use a common
          scale from 0 to 10, and the overall score is the weighted average of
          the applicable metrics.
        </p>

        <h2 className={styles.sectionTitle}>The unit of review</h2>
        <p>
          A cuck chair on its own is just furniture — what makes it good is the
          situation it gets used in. A chair is only ever reviewed where it
          earns its keep, so no review here judges the seat in isolation. The
          unit of review is the <strong>whole setup</strong>:
        </p>
        <ul className={styles.unitList}>
          <li>
            <strong>The chair</strong> — its build, comfort, adjustability, and
            what it costs.
          </li>
          <li>
            <strong>The room</strong> — how the space around it houses the
            scene: layout, presence, power, acoustics.
          </li>
          <li>
            <strong>Its position</strong> — where the seat sits in that room:
            sightlines, distance and angle to the action, and how long the
            view stays usable.
          </li>
        </ul>
        <p className={styles.closeNote}>
          That is why <strong>Position and sightlines</strong> carries the
          heaviest single weight (22%), and why several metrics score the room
          rather than the chair alone.
        </p>

        <h2 className={styles.sectionTitle}>Core metrics and weights</h2>
        <table className={styles.metricsTable}>
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col" className={styles.num}>Weight</th>
              <th scope="col">Evaluation</th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => (
              <tr key={m.name}>
                <td className={styles.name}>{m.name}</td>
                <td className={styles.weight}>{Math.round(m.weight * 100)}%</td>
                <td className={styles.evaluation}>{m.evaluation}</td>
              </tr>
            ))}
            <tr>
              <td className={styles.name}>Total</td>
              <td className={styles.weight}>100%</td>
              <td className={styles.evaluation}></td>
            </tr>
          </tbody>
        </table>

        <h2 className={styles.sectionTitle}>Overall score formula</h2>
        <p className={styles.formula}>
          Overall score = Σ(metric score × metric weight) / Σ(applicable metric weights)
        </p>
        <p>
          Metrics that genuinely do not apply to a setup are excluded from the
          calculation, and the remaining weights are renormalised. Reviews
          explain any material exclusions.
        </p>

        <h2 className={styles.sectionTitle}>Editorial standards</h2>
        <ul className={styles.standards}>
          <li>Distinguish observed facts from subjective assessments.</li>
          <li>
            Disclose relevant sponsorships, gifted products, and affiliate
            links in every review.
          </li>
          <li>Avoid unsupported product claims.</li>
          <li>Apply scoring criteria consistently.</li>
          <li>Date reviews and update them when material information changes.</li>
        </ul>

        <p className="panelBack">
          <Link href="/" className="panelBackLink">Return to homepage</Link>
        </p>
      </div>
    </main>
  );
}
