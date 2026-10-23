/*
 * Manual verification script for navigation links between the homepage
 * and review pages.
 *
 * Usage:
 *   npx serve --single out --listen 8080   # serve the static export
 *   node scripts/verify-links.js
 *
 * Override target with:
 *   BASE_URL=http://localhost:9000 node scripts/verify-links.js
 */
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Start on homepage
  await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  console.log('On homepage:', await page.title());

  // Get all review link hrefs
  const hrefs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="/reviews/"]')).map((a) => a.href);
  });
  console.log('Review link hrefs:', hrefs);

  // Click through every unique review *detail* link found on the homepage.
  // Exclude the directory page itself (/reviews/), which has no score display.
  const reviewPaths = [
    ...new Set(hrefs.map((href) => new URL(href).pathname)),
  ].filter((pathname) => /^\/reviews\/.+/.test(pathname) && pathname !== '/reviews/');
  for (const reviewPath of reviewPaths) {
    await page.goto(BASE_URL + reviewPath, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    console.log(`\nVisiting ${reviewPath}:`);
    console.log('  URL:', page.url());
    console.log('  Title:', await page.title());
    const h1 = await page.locator('h1').textContent();
    console.log('  H1:', h1);
    const scoreLocator = page.locator('[class*="overallScore"]');
    if ((await scoreLocator.count()) > 0) {
      console.log('  Score:', await scoreLocator.first().textContent());
    }
  }

  await browser.close();
  console.log('\nDone.');
})();
