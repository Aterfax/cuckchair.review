import type { Metadata } from 'next';
import Link from 'next/link';
import { collectTags, findReviewsByTag } from '../../lib/reviews';
import { formatDate } from '../../lib/format';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return collectTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `${tag.charAt(0).toUpperCase()}${tag.slice(1)} reviews | cuckchair.review`,
    description: `Independent cuck chair reviews tagged "${tag}", scored against the same weighted methodology.`,
    alternates: { canonical: `https://cuckchair.review/tags/${tag}/` },
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const reviews = findReviewsByTag(tag);
  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">CATEGORY</p>
        <h1>#{tag} reviews</h1>
        <p className="directoryIntro">
          {reviews.length} independent review{reviews.length !== 1 ? 's' : ''} tagged{' '}
          <strong>#{tag}</strong>, scored against the same{' '}
          <Link href="/methodology/">weighted methodology</Link>.
        </p>

        <ul className="reviewGrid">
          {reviews.map((review) => (
            <li key={review.slug} className="reviewCard">
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
              <div className="reviewTags">
                {(review.tags ?? []).map((t) => (
                  <Link key={t} href={`/tags/${t}/`} className="reviewTag">
                    #{t}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <p className="panelBack">
          <Link href="/reviews/" className="panelBackLink">
            Back to all reviews
          </Link>
        </p>
      </div>
    </main>
  );
}
