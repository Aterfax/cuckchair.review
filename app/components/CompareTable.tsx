'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export interface CompareReview {
  slug: string;
  title: string;
  author: string;
  date: string;
  overallScore: number;
  categories: { name: string; score: number }[];
  tags?: string[];
  specs?: { label: string; value: string }[];
  image?: { src: string; alt: string } | null;
}

interface CompareTableProps {
  reviews: CompareReview[];
}

const MAX_SELECTED = 3;

function priceOf(review: CompareReview): string | null {
  return review.specs?.find((s) => s.label.toLowerCase() === 'price')?.value ?? null;
}

export default function CompareTable({ reviews }: CompareTableProps) {
  const [selected, setSelected] = useState<string[]>([]);

  // Selection lives in the URL (?ids=) so states are shareable/linkable.
  useEffect(() => {
    const ids = new URLSearchParams(window.location.search).get('ids');
    if (ids) {
      setSelected(
        ids
          .split(',')
          .map((id) => id.trim())
          .filter((id) => reviews.some((r) => r.slug === id))
          .slice(0, MAX_SELECTED)
      );
    }
  }, [reviews]);

  useEffect(() => {
    window.history.replaceState(
      null,
      '',
      '/compare/' + (selected.length ? `?ids=${selected.join(',')}` : '')
    );
  }, [selected]);

  const chosen = useMemo(
    () => selected.map((slug) => reviews.find((r) => r.slug === slug)).filter(Boolean),
    [selected, reviews]
  ) as CompareReview[];

  return (
    <div className="compareWrap">
      {chosen.length === 0 && (
        <div className="compareEmpty">
          <p className="compareHint">
            Comparisons are built in the review directory: tick <strong>Compare</strong> on two
            or three chairs, then hit the compare button that appears.
          </p>
          <Link href="/reviews/" className="compareBarBtn">
            Browse the directory →
          </Link>
        </div>
      )}

      {chosen.length === 1 && (
        <p className="compareHint">
          That's one chair — comparisons need at least two. Head back to the{' '}
          <Link href="/reviews/">review directory</Link> and tick another Compare box.
        </p>
      )}

      {chosen.length >= 2 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="compareTable">
            <thead>
              <tr>
                <th scope="col" aria-label="Property"></th>
                {chosen.map((r) => (
                  <th scope="col" key={r.slug}>
                    {r.image && <img src={r.image.src} alt="" className="compareThumb" />}
                    <span className="compareHeading">{r.title}</span>
                    <button
                      type="button"
                      className="compareRemove"
                      onClick={() => setSelected(selected.filter((s) => s !== r.slug))}
                      aria-label={`Remove ${r.title} from comparison`}
                    >
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Price</th>
                {chosen.map((r) => (
                  <td key={r.slug}>{priceOf(r) ?? '—'}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Overall score (weighted)</th>
                {chosen.map((r) => (
                  <td key={r.slug} className="compareScore">
                    {r.overallScore}/10
                  </td>
                ))}
              </tr>
              {(chosen[0].categories ?? []).map((cat) => (
                <tr key={cat.name}>
                  <th scope="row">{cat.name}</th>
                  {chosen.map((r) => {
                    const score = r.categories.find((c) => c.name === cat.name)?.score;
                    return (
                      <td key={r.slug} className={score === Math.max(...chosen.map((c) => c.categories.find((cc) => cc.name === cat.name)?.score ?? 0)) ? 'compareBest' : ''}>
                        {score !== undefined ? `${score}/10` : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <th scope="row">Tags</th>
                {chosen.map((r) => (
                  <td key={r.slug}>
                    <div className="reviewTags">
                      {(r.tags ?? []).map((t) => (
                        <Link key={t} href={`/tags/${t}/`} className="reviewTag">
                          #{t}
                        </Link>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" aria-label="Link"></th>
                {chosen.map((r) => (
                  <td key={r.slug}>
                    <Link href={`/reviews/${r.slug}/`} className="compareLink">
                      Read the review →
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
