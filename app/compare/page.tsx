import type { Metadata } from 'next';
import CompareTable, { CompareReview } from '../components/CompareTable';
import { loadAllReviews } from '../lib/reviews';

export const metadata: Metadata = {
  title: 'Compare chairs | cuckchair.review',
  description:
    'Side-by-side cuck chair comparison: weighted category scores, price, and specifications across up to three chairs.',
  alternates: { canonical: 'https://cuckchair.review/compare/' },
};

export default function ComparePage() {
  // Only ship what the client needs to render the table.
  const reviews: CompareReview[] = loadAllReviews()
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      author: r.author,
      date: r.date,
      overallScore: r.overallScore,
      categories: r.categories,
      tags: r.tags,
      specs: r.specs,
      image:
        r.images && r.images.length > 0 ? { src: r.images[0].src, alt: r.images[0].alt } : null,
    }));

  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">SIDE-BY-SIDE</p>
        <h1>Compare chairs</h1>
        <p className="directoryIntro">
          Side-by-side scores for the chairs you picked in the review directory:
          weighted metrics, price, and specifications — all scored against the
          same methodology.
        </p>

        <CompareTable reviews={reviews} />
      </div>
    </main>
  );
}
