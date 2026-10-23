# cuckchair.review

**Independent reviews. Unobstructed perspectives.**

`cuckchair.review` is an editorial review directory dedicated to cuck chairs — reviewed as complete setups: the chair, the room around it, and its position in the scene.

**Live site:** https://cuckchair.review

## Project goals

* Publish independent, structured editorial reviews.
* Provide consistent scoring criteria across reviewed setups.
* Help readers compare whole setups — chair, room, and position — on practical use, comfort, and design.
* Present photography, specifications, strengths, weaknesses, and verdicts clearly.
* Support search, filtering, sorting, categories, and individual review pages.
* Operate as a statically generated website hosted on GitHub Pages, without maintaining a backend server or database.

## Technology stack

* **Next.js** - React framework and static site generation.
* **React** - component-based user interface.
* **TypeScript** - typed application code.
* **CSS** - responsive styling and dark-tech visual design.
* **GitHub Actions** - automated builds and deployments.
* **GitHub Pages** - static hosting.
* **Git** - version control and editorial content management.

## Design direction

TBC, but some ideas:

* High-contrast typography and clear editorial hierarchy.
* Image-led review cards and product photography.
* Distinctive rating indicators and category labels.
* Responsive layouts for desktop, tablet, and mobile.
* Accessible colour contrast and reduced-motion support.

The design should remain functional and readable rather than relying on decorative effects at the expense of content.

## Review framework

Reviews use a consistent scoring model with an overall score out of 10 and individual category ratings. The unit of review is the whole setup: the cuck chair, the room it sits in, and its position within that room.

### Core metrics

The current working suggestion list:

| Metric                              |   Weight | Evaluation                                                                         |
| ----------------------------------- | -------: | ---------------------------------------------------------------------------------- |
| Position and sightlines             |      22% | Where the seat sits in the room: distance and angle to the action, unobstructed sightlines, and how long the view stays usable |
| Room presence                       |      12% | How the setup looks and belongs: design, finish, and whether chair and room read as one deliberate ensemble |
| Comfort for the session             |      12% | Comfort of the whole dwell — seating, posture, and the room around it (climate, noise, light) over a long session |
| Workspace and devices               |      12% | Room-equipped practical space for phones, laptops, peripherals, and accessories within reach of the seat |
| Audio in the room                   |       8% | The listening position, not just the speaker: reflections, noise bleed, and equipment placement relative to the seat |
| Build and stability                 |       8% | Materials, construction, and stability of the chair as the fixed anchor of the arrangement |
| Power and practicality              |       8% | Room realities: power access, cable routing, walkways, and everything that keeps the positioning workable |
| Room dynamics and layout            |       8% | Footprint relative to functionality and how the arrangement works as a room: door lines, light, sightline flow |
| Customisation and adaptability      |       5% | How flexibly the setup adapts: chair adjustability, accessories, and easy repositioning inside the room |
| Value for the setup                 |       5% | What this chair does for the whole ensemble relative to its price                  |
| **Total**                           | **100%** |                                                                                    |

Metric scores use a common scale from 0 to 10. The weighted overall score is calculated as:

`Overall score = Σ(category score × category weight) / Σ(applicable category weights)`

Metrics that genuinely do not apply to a product are excluded from the calculation, and the remaining weights are renormalised. Reviews should explain any material exclusions.

### Additional review criteria

Depending on the product, reviews may also cover:

* Viewing distance and immersion.
* Adjustability and positioning flexibility.
* Ease of entry and exit.
* Discretion and visual integration.
* Storage and portability.
* Ease of assembly and maintenance.
* Upholstery and cleanability.
* Privacy considerations.
* Device compatibility and thermal management, where relevant.

Not every supplementary criterion needs to be scored for every product but we should ensure any special features are noted.

### Editorial standards

* Distinguish observed facts from subjective assessments.
* Disclose relevant sponsorships, gifted products, and affiliate links.
* Avoid unsupported product claims.
* Apply scoring criteria consistently.
* Date reviews and update them when material information changes.

## Site structure

```
app/                     Next.js App Router pages and application code.
  components/            MainLayout, ReviewLayout, ReviewBrowser,
                         ImageViewer, CompareTable, CuckGuessr, Logo,
                         ParallaxBackground (with CSS modules).
  games/                 /games/ index and /games/cuckguessr/ game.
  lib/                   reviews.ts (data model, scoring engine, tags),
                         cuckguessr.ts (game rounds).
  reviews/               Review directory and individual review pages
                         (/reviews/[slug], SSG from content).
  tags/[tag]/            Category pages, one per tag found in content.
  compare/               Side-by-side chair comparison (client state via ?ids=).
  disclosures/           Editorial independence and disclosure policy.
  methodology/           Scoring methodology, weights, and standards.
  layout.tsx, page.tsx   Root layout and homepage.
  robots.txt, not-found  SEO directives and the 404 page.
content/
  reviews/*.md           Review articles (gray-matter frontmatter + markdown).
  templates/             review-template.md — the canonical starting point.
public/assets/           Review imagery and cuckguessr scene art.
scripts/                 generate-sitemap.js (postbuild), preview.sh,
                         verify-*.js (manual checks).
e2e/                     Playwright: builds, serves out/, and asserts pages.
.github/workflows/       nextjs.yml — static export deploy to GitHub Pages.
```

A static export of the production site lands in `out/`. Content is added by
copying `content/templates/review-template.md` into `content/reviews/`; the
overall score is always computed from the weighted categories at build time.

## Static hosting architecture

The publication pipeline is:

1. Editorial content and application code are committed to Git.
2. A push to the deployment branch triggers GitHub Actions.
3. Dependencies are installed and the Next.js project is built.
4. Next.js exports the site into the `out/` directory.
5. GitHub Actions deploys the generated files to GitHub Pages.
6. Visitors access the published static site through `https://cuckchair.review`.

The production build must remain compatible with Next.js static export.

### Static-hosting constraints

GitHub Pages serves static assets. The deployed site therefore cannot rely on a persistent application server for:

* Server-side rendering at request time.
* Next.js API routes or server actions.
* Direct server-side database access at runtime.
* Persistent visitor accounts or submissions without an external service.

Search, sorting, filtering, galleries, and other browser-side interactions should remain possible. New editorial content is published through a repository change and rebuild.

## Development

Use Node.js 20 or another version supported by the project's Next.js dependencies.

Install dependencies:

```bash
npm ci
```

Run the development server:

```bash
npm run dev
```

Build the static site:

```bash
npm run build
```

The exported website should be available in `out/` after a successful
production build (the `postbuild` hook also regenerates `out/sitemap.xml`).

### Testing

```bash
# Playwright end-to-end suite: builds the export, serves it, and asserts
# review pages, weighted scoring, tags, compare, and the cuckguessr game.
npx playwright install --with-deps chromium   # once per machine
npm run test:e2e
```

Manual verification scripts (against a served `out/` directory):

```bash
./scripts/preview.sh        # build + serve out/ on :8080
node scripts/verify-links.js             # homepage -> every review link
node scripts/verify-review-layout.js     # layout + scoring probe
node scripts/verify-imageviewer.js       # gallery/lightbox behaviour
```

`BASE_URL` overrides `http://localhost:8080` in each verify script.

To preview the exported files locally, use a static file server, for example:

```bash
npx serve out
```

## Deployment

Deployment is automated through the repository's GitHub Actions workflow.

The workflow should:

* Run on pushes to the configured production branch.
* Install dependencies reproducibly using the committed lockfile.
* Build the static export.
* Include the custom-domain `CNAME` file containing `cuckchair.review`.
* Upload the `out/` directory as the Pages artifact.
* Deploy the artifact to GitHub Pages.

GitHub Pages must be enabled for the repository, and the custom domain and DNS records must be configured correctly.

## Roadmap

* [x] Establish the reusable review data model (weighted scoring engine in `app/lib/reviews.ts`).
* [x] Implement the review directory and individual review templates.
* [x] Add weighted scoring and transparent category breakdowns (per-metric contributions, exclusions, and renormalisation rendered on every review).
* [x] Implement client-side search, filtering, and sorting.
* [x] Add responsive image galleries (thumbnail grid + lightbox with keyboard support and focus management).
* [x] Add category pages and related-review links (`/tags/[tag]`, plus a related module on review pages).
* [x] Add side-by-side comparison (`/compare`, select chairs from the directory).
* [x] Add SEO metadata, canonical URLs, sitemap, robots directives, and review JSON-LD.
* [x] Add editorial methodology and disclosure pages.
* [x] Add the "CuckGuessr" game for fictional scenes; it has since grown a review-location deck and will graduate to real location photography as assets arrive.
* [ ] Use real (or richer placeholder) photography in reviews and the game, with responsive `<image>` handling and loading-order checks.
* [ ] Continue accessibility audits (colour contrast automation, screen-reader pass, reduced-motion fixes are in place).
* [x] Test the production static export (Playwright e2e builds and serves `out/`); keep CI green on releases.
* [ ] Review additions: structured verdict chips (e.g. "Recommended for") and richer review navigation.

## Editorial independence

Reviews should prioritise the suitability, comfort, build quality, and practical characteristics of the products being assessed. But also humour. Any commercial relationships must be disclosed, and ratings should reflect the published methodology rather than payment or "promotional arrangements".

## Licence

Unless a licence is explicitly added to the repository, assume that the source code, written reviews, and photography are not granted an open-source or unrestricted reuse licence. Third-party assets remain subject to their respective licences and permissions.
