import Link from 'next/link';

export const metadata = {
  title: 'Page not found | cuckchair.review',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <main className="page">
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(32px, 7vw, 52px)', letterSpacing: '-2px', margin: '24px 0 12px' }}>404</h1>
        <p className="intro">This review does not exist.</p>
        <p className="panelBack">
          <Link href="/" className="panelBackLink">
            Return to homepage
          </Link>
        </p>
      </div>
    </main>
  );
}
