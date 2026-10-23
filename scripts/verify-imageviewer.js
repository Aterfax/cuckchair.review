/*
 * Manual verification script for the review image viewer / lightbox.
 *
 * Usage:
 *   npx playwright install chromium   # once, for browser binaries
 *   npx serve --single out --listen 8080   # serve the static export
 *   node scripts/verify-imageviewer.js
 *
 * Override target with:
 *   BASE_URL=http://localhost:9000 node scripts/verify-imageviewer.js
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

  for (const route of routes) {
    await page.goto(BASE_URL + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const thumb = page.locator('img[class*="thumb"]');
    const thumbCount = await thumb.count();
    console.log(`\n== ${route} ==`);
    console.log('Thumbnail count:', thumbCount);
    if (thumbCount === 0) {
      console.log('No images for this review, skipping lightbox checks.');
      continue;
    }

    // 1. First thumbnail is visible
    console.log('First thumb visible:', await thumb.first().isVisible());

    // 2. Click first thumbnail to open the lightbox
    await thumb.first().click();
    await page.waitForTimeout(300);

    const overlay = page.locator('[class*="overlay"]');
    console.log('Lightbox overlay visible:', await overlay.isVisible());
    console.log('Counter text:', await page.locator('[class*="counter"]').textContent());
    console.log(
      'Lightbox image src:',
      await page.locator('img[class*="lightboxImage"]').getAttribute('src')
    );

    // 3. Click next (only meaningful with multiple images)
    if (thumbCount > 1) {
      await page.locator('[class*="next"]').click();
      await page.waitForTimeout(300);
      console.log('Counter after next:', await page.locator('[class*="counter"]').textContent());
      console.log(
        'Lightbox image src after next:',
        await page.locator('img[class*="lightboxImage"]').getAttribute('src')
      );

      // 4. Click prev to go back
      await page.locator('[class*="prev"]').click();
      await page.waitForTimeout(300);
      console.log('Counter after prev:', await page.locator('[class*="counter"]').textContent());
    }

    // 5. Press ESC to close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    console.log('Overlay closed on ESC:', !(await overlay.isVisible()));

    // 6. Reopen, then click outside the lightbox to close
    await thumb.first().click();
    await page.waitForTimeout(300);
    console.log('Overlay visible after reopen:', await overlay.isVisible());
    await page.click('[class*="overlay"]', { position: { x: 50, y: 50 } });
    await page.waitForTimeout(300);
    console.log('Overlay closed after click outside:', !(await overlay.isVisible()));
  }

  await browser.close();
  console.log('\nAll image viewer checks completed.');
})();
