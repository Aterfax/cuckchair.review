import Link from 'next/link';
import type { Metadata } from 'next';
import { loadAllReviews } from './lib/reviews';
import { formatDate } from './lib/format';
import ScoreBadge from './components/ScoreBadge';

export const metadata: Metadata = {
  title: 'cuckchair.review',
  description:
    'Independent cuck chair reviews scored as complete setups: the chair, the room around it, and its position in the scene — one weighted methodology.',
  alternates: { canonical: 'https://cuckchair.review/' },
};

export default function Home() {
  const reviews = loadAllReviews().sort(
    (a, b) => (b.date ?? '').localeCompare(a.date ?? '')
  );
  const featured = reviews[0];
  const latest = reviews.slice(1, 4);

  return (
    <main className="page">
      <div className="homeWrapper">
        <section className="hero">
          <p className="eyebrow">INDEPENDENT CUCK CHAIR REVIEWS &bull; SETUP-SCORED</p>
          <h1 className="heroTitle">
            cuckchair<span className="heroDot">.</span>review
          </h1>
          <p className="intro">
            A cuck chair is only ever reviewed where it earns its keep. Every
            review scores the whole setup — the chair, the room around it, and
            its position in it: sightlines, comfort, practicality, presence,
            and the chair&apos;s role in the scene, weighted into one
            comparable number.
          </p>
          <div className="heroCtas">
            <Link href="/reviews/" className="btnPrimary">
              Browse the reviews
            </Link>
            <Link href="/games/cuckguessr/" className="btnGhost">
              Play CuckGuessr
            </Link>
          </div>
        </section>

        {featured && (
          <section className="homeSection">
            <h2 className="sectionHeading">Featured review</h2>
            <Link href={`/reviews/${featured.slug}/`} className="featuredCard">
              {featured.images && featured.images.length > 0 && (
                <img
                  src={featured.images[0].src}
                  alt={featured.images[0].alt}
                  className="featuredThumb"
                />
              )}
              <div className="featuredBody">
                <h3 className="featuredTitle">{featured.title}</h3>
                <p className="featuredMeta">
                  by {featured.author} &bull; {formatDate(featured.date)}
                </p>
              </div>
              <ScoreBadge score={featured.overallScore} size="lg" />
            </Link>
          </section>
        )}

        {latest.length > 0 && (
          <section className="homeSection">
            <h2 className="sectionHeading">Latest reviews</h2>
            <ul className="latestList">
              {latest.map((review) => (
                <li key={review.slug}>
                  <Link href={`/reviews/${review.slug}/`} className="latestRow">
                    <span className="latestTitle">{review.title}</span>
                    <span className="latestScore">{review.overallScore}/10</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>
    </main>
  );
}
