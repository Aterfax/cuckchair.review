# cuckchair.review

**Independent reviews. Unobstructed perspectives.**

`cuckchair.review` is an editorial review directory dedicated to cuck chairs: seating evaluated for viewing position, comfort, practicality, discretion, aesthetics, and overall suitability for its intended setting.

**Live site:** https://cuckchair.review

## Project goals

* Publish independent, structured editorial reviews.
* Provide consistent scoring criteria across reviewed products.
* Help readers compare chairs based on practical use, comfort, and design.
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

Reviews use a consistent scoring model with an overall score out of 10 and individual category ratings.

### Core metrics

The current working suggestion list:

| Metric                            |   Weight | Evaluation                                                            |
| --------------------------------- | -------: | --------------------------------------------------------------------- |
| Viewing angle and visibility      |      15% | Sightlines, obstructions, and viewing-position flexibility            |
| Workspace and device capacity     |      15% | Practical space for phones, laptops, peripherals, and accessories     |
| Comfort and ergonomics            |      15% | Seating comfort, posture, and suitability for extended use            |
| Aesthetic appeal                  |      12% | Design, finish, and visual integration into the room                  |
| Audio experience                  |      10% | Suitability of the seating position for listening and audio equipment |
| Build quality and stability       |      10% | Materials, construction, durability, and stability                    |
| Cable management and power access |       8% | Cable routing and practical access to power                           |
| Space efficiency                  |       5% | Footprint relative to functionality                                   |
| Customisation potential           |       5% | Adjustability, accessories, and modification options                  |
| Value for money                   |       5% | Overall quality and suitability relative to price                     |
| **Total**                         | **100%** |                                                                       |

Category scores use a common scale from 0 to 10. The weighted overall score is calculated as:

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

TBC

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

The exported website should be available in `out/` after a successful production build.

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

* [ ] Establish the reusable review data model.
* [ ] Implement the review directory and individual review templates.
* [ ] Add weighted scoring and transparent category breakdowns.
* [ ] Implement client-side search, filtering, and sorting.
* [ ] Add responsive image galleries.
* [ ] Add category pages and related-review links.
* [ ] Add SEO metadata, canonical URLs, sitemap, and robots directives.
* [ ] Add editorial methodology and disclosure pages.
* [ ] Optimise images and verify accessibility.
* [ ] Test the production static export and GitHub Pages deployment.
* [ ] Add a "geo-guesser" game page where random cuckchair images are presented and the user must guess on the location and hotel brand where appropriate.

## Editorial independence

Reviews should prioritise the suitability, comfort, build quality, and practical characteristics of the products being assessed. But also humour. Any commercial relationships must be disclosed, and ratings should reflect the published methodology rather than payment or "promotional arrangements".

## Licence

Unless a licence is explicitly added to the repository, assume that the source code, written reviews, and photography are not granted an open-source or unrestricted reuse licence. Third-party assets remain subject to their respective licences and permissions.
