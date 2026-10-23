export const metadata = {
  title: 'Editorial independence & disclosures | cuckchair.review',
  description:
    'cuckchair.review editorial independence policy: sponsorships, gifts, affiliate links, and how ratings are kept separate from commercial relationships.',
  alternates: { canonical: 'https://cuckchair.review/disclosures/' },
};

export default function Disclosures() {
  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">EDITORIAL INDEPENDENCE</p>
        <h1>Disclosures and editorial policy</h1>
        <p className="intro">
          cuckchair.review is an independent editorial review directory.
          Ratings reflect the published scoring methodology rather than
          payment or promotional arrangements.
        </p>

        <h2 style={{ fontSize: 18, margin: '24px 0 10px', color: '#e5e7eb' }}>
          Sponsorship and gifts
        </h2>
        <p style={{ color: '#c0cadb', lineHeight: 1.7, marginBottom: 16 }}>
          If a product was provided by a manufacturer, retailer, or any other
          commercial party — whether free, at a discount, or on loan — the
          fact is disclosed at the top of that review. A disclosed sample does
          not guarantee a favourable score.
        </p>

        <h2 style={{ fontSize: 18, margin: '24px 0 10px', color: '#e5e7eb' }}>
          Affiliate links
        </h2>
        <p style={{ color: '#c0cadb', lineHeight: 1.7, marginBottom: 16 }}>
          Reviews may link to retailer product pages. Where a link is an
          affiliate link, it is marked as such in the review. Affiliate
          earnings never influence which products are reviewed or how they are
          scored.
        </p>

        <h2 style={{ fontSize: 18, margin: '24px 0 10px', color: '#e5e7eb' }}>
          Purchased products
        </h2>
        <p style={{ color: '#c0cadb', lineHeight: 1.7, marginBottom: 16 }}>
          Where a chair was purchased independently at retail price, the review
          states so. Independent purchases carry no commercial relationship to
          disclose.
        </p>

        <h2 style={{ fontSize: 18, margin: '24px 0 10px', color: '#e5e7eb' }}>
          Rating integrity
        </h2>
        <p style={{ color: '#c0cadb', lineHeight: 1.7, marginBottom: 24 }}>
          Observed facts are distinguished from subjective assessments, and all
          ratings apply the published scoring criteria consistently. Any
          commercial relationship is disclosed alongside the review so readers
          can weigh it themselves.
        </p>

        <p className="panelBack">
          <a href="/methodology/" className="panelBackLink">View scoring methodology</a>
          &nbsp;|&nbsp;
          <a href="/" className="panelBackLink">Return to homepage</a>
        </p>
      </div>
    </main>
  );
}
