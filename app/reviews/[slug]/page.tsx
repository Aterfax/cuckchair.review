import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findReviewBySlug, findRelatedReviews } from '../../lib/reviews';
import ReviewLayout from '../../components/ReviewLayout';
import ReactMarkdown from 'react-markdown';

export const dynamic = 'force-static'; // ensure static generation

export async function generateStaticParams() {
  const reviews = await import('../../lib/reviews').then(m => m.loadAllReviews());
  return reviews.map(r => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const review = await findReviewBySlug(slug);
  if (!review) {
    notFound();
  }
  return {
    title: `${review.title} | cuckchair.review`,
    description: `Independent review of ${review.title} — overall score ${review.overallScore}/10 by ${review.author}.`,
    alternates: { canonical: `https://cuckchair.review/reviews/${review.slug}/` },
    openGraph: {
      title: `${review.title} | cuckchair.review`,
      description: `Overall score ${review.overallScore}/10`,
      type: 'article',
      publishedTime: review.date,
      authors: [review.author],
      images:
        review.images && review.images.length > 0
          ? [{ url: `https://cuckchair.review${review.images[0].src}`, alt: review.images[0].alt }]
          : undefined,
    },
  };
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const review = await findReviewBySlug(slug);
  if (!review) {
    notFound();
  }
  const related = findRelatedReviews(review);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: review.title,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.overallScore,
      bestRating: 10,
      worstRating: 0,
    },
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: review.date,
    ...(review.updated ? { dateModified: review.updated } : {}),
  };
  // Escape < so review content can never terminate the script tag early.
  const jsonLdSafe = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe }}
      />
      <ReviewLayout review={review} relatedReviews={related}>
        <ReactMarkdown>{review.content}</ReactMarkdown>
      </ReviewLayout>
    </>
  );
}
