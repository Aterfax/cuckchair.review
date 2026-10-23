import ReviewBrowser from '../components/ReviewBrowser';
import type { Metadata } from 'next';
import { loadAllReviews } from '../lib/reviews';

export const metadata: Metadata = {
  title: 'Review directory | cuckchair.review',
  description:
    'Browse every independent cuck chair review: search, filter by tag, sort by score or date, and compare whole setups side by side.',
  alternates: { canonical: 'https://cuckchair.review/reviews/' },
};

export default function ReviewsDirectory() {
  // Ship only the fields the browser renders; review content stays on the
  // server so the directory payload stays small.
  const reviews = loadAllReviews()
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .map((review) => ({
      slug: review.slug,
      title: review.title,
      author: review.author,
      date: review.date,
      overallScore: review.overallScore,
      tags: review.tags,
      images: review.images,
    }));

  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">REVIEW DIRECTORY</p>
        <h1>Review directory</h1>
        <p className="directoryIntro">
          {reviews.length} independent cuck chair reviews, scored as complete setups — chair, room, and position — against one consistent methodology.
        </p>

        <ReviewBrowser reviews={reviews} />
      </div>
    </main>
  );
}
