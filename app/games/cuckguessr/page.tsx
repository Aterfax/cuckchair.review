import type { Metadata } from 'next';
import Link from 'next/link';
import CuckGuessr from '../../components/CuckGuessr';
import { loadAllReviews } from '../../lib/reviews';
import { buildRounds } from '../../lib/cuckguessr';

export const metadata: Metadata = {
  title: 'CuckGuessr | cuckchair.review',
  description:
    'A cuckchair.review game: study a viewing-seat scene and guess the location — and, where identifiable, the establishment — across rounds drawn from the review archive plus a few fictional scenes.',
  alternates: { canonical: 'https://cuckchair.review/games/cuckguessr/' },
};

export default function CuckGuessrPage() {
  const rounds = buildRounds(loadAllReviews());
  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">GAMES</p>
        <h1>CuckGuessr</h1>
        <p className="intro">
          Six scenes. One chair per scene, doing what it was made to do.
          Scenes come from the review archive — real chairs, real scores —
          plus a few fictional sets to fill the table. Guess where each seat
          is earning its keep.
        </p>
        <CuckGuessr rounds={rounds} />
        <p className="panelBack">
          <Link href="/games/" className="panelBackLink">Back to games</Link>
        </p>
      </div>
    </main>
  );
}
