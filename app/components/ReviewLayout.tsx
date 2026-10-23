import React from 'react';
import Link from 'next/link';
import styles from './ReviewLayout.module.css';
import type { Review } from '../lib/reviews';
import { computeWeightedScore } from '../lib/reviews';
import { formatDate } from '../lib/format';
import ImageViewer from './ImageViewer';
import ScoreBadge from './ScoreBadge';

interface Props {
  review: Review;
  /** Reviews sharing at least one tag, prepared by the caller. */
  relatedReviews?: Review[];
  children?: React.ReactNode;
}

export default function ReviewLayout({ review, relatedReviews = [], children }: Props) {
  const { applied, excluded, score } = computeWeightedScore(review.categories, review.excludes ?? []);
  // Explicit editorial flag from frontmatter: true when the unit was
  // supplied, gifted, discounted or sponsored.
  const sponsored = review.commercial === true;
  // Contributions on a 0-10 scale: (score × weight) / Σ(applied weights).
  const appliedWeight = applied.reduce((sum, a) => sum + a.weight, 0);

  return (
    <article className={styles.reviewPage}>
      <div className="card">
        <header className={styles.header}>
          <div className={styles.scoreHeader}>
            <div className={styles.headerMain}>
              <h1>{review.title}</h1>
              <p className={styles.meta}>
                by {review.author} &bull; {formatDate(review.date, true)}
                {review.updated && <> &bull; Updated {formatDate(review.updated, true)}</>}
              </p>
              {review.location?.setting && (
                <p className={styles.where}>
                  Where: {review.location.place ?? review.location.setting}
                  {review.location.map && (
                    <>
                      {' '}·{' '}
                      <a
                        className={styles.whereLink}
                        href={review.location.map}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in Google Maps
                      </a>
                    </>
                  )}
                </p>
              )}
              {review.location?.setting && (
                <p className={styles.setupNote}>
                  Reviewed as a setup: chair, room, and position.
                </p>
              )}
              <p className={styles.overallScore}>
                Overall Score: <span className={styles.scoreValue}>{score}/10</span>
                <span className={styles.scoreNote}>(weighted)</span>
              </p>
            </div>
            <ScoreBadge
              score={score}
              size="lg"
              label={`Overall weighted score ${score} out of 10`}
            />
          </div>
        </header>

        {review.images && review.images.length > 0 && (
          <ImageViewer images={review.images} />
        )}

        {review.specs && review.specs.length > 0 && (
          <section className={styles.specsSection}>
            <h2 className={styles.sectionTitle}>Specifications</h2>
            <table className={styles.table}>
              <tbody>
                {review.specs.map((spec) => (
                  <tr key={spec.label}>
                    <td className={styles.metricName}>{spec.label}</td>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section className={styles.categories}>
          <h2 className={styles.sectionTitle}>The ensemble scorecard (weighted breakdown)</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col" className={styles.num}>Score</th>
                <th scope="col" className={styles.num}>Weight</th>
                <th scope="col" className={styles.num}>Contribution (of 10)</th>
              </tr>
            </thead>
            <tbody>
              {applied.map((row) => (
                <tr key={row.name}>
                  <td className={styles.metricName}>{row.name}</td>
                  <td className={styles.num}>{row.score}/10</td>
                  <td className={styles.num}>{Math.round(row.weight * 100)}%</td>
                  <td className={styles.num}>{((row.score * row.weight) / appliedWeight).toFixed(2)}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td colSpan={3}>Weighted overall (computed)</td>
                <td className={styles.num}>{score}/10</td>
              </tr>
            </tbody>
          </table>
          {excluded.length > 0 && (
            <p className={styles.exclusionsNote}>
              Excluded: <strong>{excluded.map((e) => e.name).join(', ')}</strong> — these metrics do
              not apply to this product, so the remaining weights were renormalised.
            </p>
          )}
        </section>

        {review.disclaimer && (
          <p className={styles.disclaimer}>
            <strong>Editorial disclosure:</strong> {review.disclaimer}
          </p>
        )}

        <section className={styles.content}>{children}</section>

        {review.links && review.links.length > 0 && (
          <div className={styles.links}>
            {review.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                className={styles.linkButton}
                target="_blank"
                rel={
                  'noopener nofollow' + (sponsored ? ' sponsored' : '')
                }
              >
                {link.name} →
              </a>
            ))}
          </div>
        )}

        {relatedReviews.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.sectionTitle}>Related reviews</h2>
            <ul className="reviewGrid">
              {relatedReviews.map((related) => (
                <li key={related.slug} className="reviewCard">
                  <Link href={`/reviews/${related.slug}/`} className="reviewCardLink">
                    {related.images && related.images.length > 0 && (
                      <img
                        src={related.images[0].src}
                        alt={related.images[0].alt}
                        className="reviewThumb"
                      />
                    )}
                    <div className="reviewCardBody">
                      <h3 className="reviewTitle">{related.title}</h3>
                      <p className="reviewScore">Overall score: {related.overallScore}/10</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
