/*
 * Manual verification script for the review page layout.
 *
 * Usage:
 *   npx serve --single out --listen 8080   # serve the static export
 *   node scripts/verify-review-layout.js
 *
 * Override target with:
 *   BASE_URL=http://localhost:9000 node scripts/verify-review-layout.js
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

// Discover review routes from the static export instead of hardcoding slugs.
function reviewRoutes() {
  const dir = path.join(process.cwd(), 'out', 'reviews');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => `/reviews/${e.name}/`);
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const routes = reviewRoutes();
  if (routes.length === 0) {
    console.error('No exported reviews found. Run "npm run build" first.');
    process.exit(1);
  }

  // Detailed layout inspection of the first review
  await page.goto(BASE_URL + routes[0], { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const info = await page.evaluate(() => {
    // CSS module classes are hashed in production, so use substring matches.
    const h1 = document.querySelector('h1');
    const meta = document.querySelector('[class*="meta"]');
    const overallScore = document.querySelector('[class*="overallScore"]');
    // The scoring table is the one whose header row names a "Metric" column
    // (this skips the specs table, which has no header row).
    const tables = Array.from(document.querySelectorAll('table'));
    const categoriesTable = tables.find((t) =>
      t.querySelector('thead th')?.textContent?.includes('Metric')
    );
    const contentSection = document.querySelector('[class*="content"]');
    const thumbnails = document.querySelectorAll('img[class*="thumb"]');
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;

    return {
      h1Text: h1 ? h1.textContent : null,
      h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
      metaText: meta ? meta.textContent : null,
      overallScoreText: overallScore ? overallScore.textContent : null,
      scoreValueColor: overallScore
        ? window.getComputedStyle(overallScore.querySelector('span')).color
        : null,
      categoriesRows: categoriesTable
        ? Array.from(categoriesTable.querySelectorAll('tbody tr')).filter(
            (tr) => !tr.className.includes('totalRow')
          ).length
        : 0,
      contentHasH2: !!contentSection?.querySelector('h2'),
      contentHasP: !!contentSection?.querySelector('p'),
      thumbCount: thumbnails.length,
      bodyBg,
    };
  });

  console.log(JSON.stringify(info, null, 2));

  // Check all reviews render correctly
  for (const route of routes) {
    await page.goto(BASE_URL + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const routeInfo = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const score = document.querySelector('[class*="overallScore"]');
      const tables = Array.from(document.querySelectorAll('table'));
      const categoriesTable = tables.find((t) =>
        t.querySelector('thead th')?.textContent?.includes('Metric')
      );
      const tableRows = categoriesTable
        ? Array.from(categoriesTable.querySelectorAll('tbody tr')).filter(
            (tr) => !tr.className.includes('totalRow')
          ).length
        : 0;
      const thumbs = document.querySelectorAll('img[class*="thumb"]');
      return {
        title: h1 ? h1.textContent : null,
        score: score ? score.textContent : null,
        categoryRows: tableRows,
        thumbCount: thumbs.length,
      };
    });
    console.log(`${route}:`, JSON.stringify(routeInfo));
  }

  await browser.close();
  console.log('\nReview page formatting verified.');
})();
