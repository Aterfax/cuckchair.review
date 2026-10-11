
export default function Home() {
  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">GITHUB PAGES · NEXT.JS</p>
        <h1>cuckchair.review</h1>
        <p className="intro">Your Next.js deployment is working.</p>

        <div className="status">
          <span className="indicator" />
          Static site ready
        </div>

        <hr />

        <h2>Deployment checks</h2>
        <ul>
          <li>Next.js static export</li>
          <li>GitHub Actions deployment</li>
          <li>Custom domain configuration</li>
          <li>HTTPS delivery</li>
        </ul>

        <p className="footer">
          Deployed automatically from the main branch.
        </p>
      </div>
    </main>
  );
}