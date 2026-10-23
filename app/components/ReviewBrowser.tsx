'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '../lib/format';

export const MAX_COMPARE = 3;

/** Structured fields the browser needs — deliberately excludes review content. */
export interface ReviewSummary {
  slug: string;
  title: string;
  author: string;
  date: string;
  overallScore: number;
  tags?: string[];
  images?: { src: string; alt: string }[];
}

interface ReviewBrowserProps {
  reviews: ReviewSummary[];
}

export default function ReviewBrowser({ reviews }: ReviewBrowserProps) {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [sort, setSort] = useState<'date' | 'score' | 'title'>('date');
  const [compare, setCompare] = useState<string[]>([]);

  function toggleCompare(slug: string) {
    setCompare((current) =>
      current.includes(slug)
        ? current.filter((s) => s !== slug)
        : current.length >= MAX_COMPARE
          ? current
          : [...current, slug]
    );
  }

  // Collect every tag used across reviews.
  const allTags = useMemo(
    () =>
      Array.from(
        new Set(reviews.flatMap((r) => (r.tags ?? []).map((t) => t.toLowerCase())))
      ).sort(),
    [reviews]
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    const tag = tagFilter.toLowerCase();

    let list = reviews.filter((r) => {
      const matchesSearch =
        term === '' ||
        r.title.toLowerCase().includes(term) ||
        (r.author ?? '').toLowerCase().includes(term) ||
        (r.tags ?? []).some((t) => t.toLowerCase().includes(term));
      const matchesTag = tag === '' || (r.tags ?? []).some((t) => t.toLowerCase() === tag);
      return matchesSearch && matchesTag;
    });

    list = [...list].sort((a, b) => {
      if (sort === 'score') return (b.overallScore ?? 0) - (a.overallScore ?? 0);
      if (sort === 'title') return (a.title ?? '').localeCompare(b.title ?? '');
      return (b.date ?? '').localeCompare(a.date ?? '');
    });

    return list;
  }, [reviews, search, tagFilter, sort]);

  return (
    <div className="reviewBrowser">
      <div className="browserControls">
        <div className="searchField">
          <label htmlFor="reviewSearch">Search reviews</label>
          <input
            id="reviewSearch"
            type="text"
            placeholder="Title, author, or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filterField">
          <label htmlFor="reviewTag">Filter by tag</label>
          <select id="reviewTag" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
            <option value="">All tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        </div>

        <div className="sortField">
          <label htmlFor="reviewSort">Sort by</label>
          <select id="reviewSort" value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="date">Newest first</option>
            <option value="score">Highest score</option>
            <option value="title">Title (A&ndash;Z)</option>
          </select>
        </div>
      </div>

      <p className="browserCount">
        Showing <strong>{filtered.length}</strong> of {reviews.length} review{reviews.length !== 1 ? 's' : ''}
      </p>

      <ul className="reviewGrid">
        {filtered.length === 0 ? (
          <li className="reviewCard empty">
            <p>No reviews match your search or filter.</p>
          </li>
        ) : (
          filtered.map((review) => (
            <li key={review.slug} className="reviewCard">
              <label className="compareCheck">
                <input
                  type="checkbox"
                  checked={compare.includes(review.slug)}
                  onChange={() => toggleCompare(review.slug)}
                  disabled={!compare.includes(review.slug) && compare.length >= MAX_COMPARE}
                />
                Compare
              </label>
              <Link
                href={`/reviews/${review.slug}/`}
                className="reviewCardLink"
                aria-label={review.title}
              >
                {review.images && review.images.length > 0 && (
                  <img src={review.images[0].src} alt={review.images[0].alt} className="reviewThumb" />
                )}
                <div className="reviewCardBody">
                  <h2 className="reviewTitle">{review.title}</h2>
                  <p className="reviewMeta">
                    by {review.author} &bull; {formatDate(review.date)}
                  </p>
                  <p className="reviewScore">Overall score: {review.overallScore}/10</p>
                </div>
              </Link>
              {/* Tag chips live outside the review link: nested <a> elements are
                  invalid HTML, get reparented by the HTML parser, and trigger a
                  hydration mismatch (React error #418) on every page load. */}
              {review.tags && review.tags.length > 0 && (
                <div className="reviewTags">
                  {review.tags.map((tag) => (
                    <Link key={tag} href={`/tags/${tag}/`} className="reviewTag">
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))
        )}
      </ul>

      {compare.length > 0 && (
        <div className="compareBar" role="region" aria-label="Compare selection">
          {compare.map((slug) => {
            const review = reviews.find((r) => r.slug === slug);
            return (
              <span key={slug} className="compareChip">
                {review?.title}
                <button
                  type="button"
                  onClick={() => toggleCompare(slug)}
                  aria-label={`Remove ${review?.title} from comparison`}
                >
                  ×
                </button>
              </span>
            );
          })}
          {compare.length >= 2 ? (
            <Link href={`/compare/?ids=${compare.join(',')}`} className="compareBarBtn">
              Compare {compare.length} chairs →
            </Link>
          ) : (
            <span className="compareBarBtn disabled" aria-disabled="true">
              Pick at least 2 chairs to compare
            </span>
          )}
        </div>
      )}
    </div>
  );
}
