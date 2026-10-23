import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Games | cuckchair.review',
  description: 'Browser games on cuckchair.review, starting with the CuckGuessr challenge.',
  alternates: { canonical: 'https://cuckchair.review/games/' },
};

export default function GamesIndex() {
  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">GAMES</p>
        <h1>Games</h1>
        <p className="intro">Ten minutes of chair-themed procrastination.</p>

        <ul className="reviewGrid">
          <li className="reviewCard">
            <Link href="/games/cuckguessr/" className="reviewCardLink">
              <div className="reviewCardBody">
                <h2 className="reviewTitle">CuckGuessr</h2>
                <p className="reviewMeta">Scenes from the review archive — guess the location and the venue.</p>
                <p className="reviewScore">+10 per location • +5 per brand</p>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
