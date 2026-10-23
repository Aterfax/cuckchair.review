import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { spawn, execSync, ChildProcess } from 'child_process';

const SERVE_PORT = Number(process.env.SERVE_PORT || 8080);
const BASE_URL = `http://localhost:${SERVE_PORT}`;
const OUT_DIR = path.join(process.cwd(), 'out');

let serveProcess: ChildProcess | undefined;

function startServe() {
  // Resolve the serve binary from node_modules so no shell wrapper is needed
  // and the PID belongs to the actual server process.
  const serveBin = require.resolve('serve/build/main.js');
  serveProcess = spawn(process.execPath, [serveBin, OUT_DIR, '--listen', SERVE_PORT.toString()], {
    stdio: 'inherit',
  });

  serveProcess.on('error', (err) => {
    console.error('Failed to start preview server:', err);
  });
}

function stopServe() {
  if (serveProcess && serveProcess.pid) {
    serveProcess.kill();
    serveProcess = undefined;
  }
}

// Wait for the preview server to accept connections.
async function waitForServer() {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE_URL}/`, { method: 'HEAD' });
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Preview server did not start on port ${SERVE_PORT}`);
}

function exportedReviewSlugs(): string[] {
  // Static export emits one directory per review containing index.html.
  return fs
    .readdirSync(path.join(OUT_DIR, 'reviews'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'index.html')
    .map((entry) => entry.name);
}

test.describe('Review pages', () => {
  test.beforeAll(async () => {
    execSync('npm run build', { cwd: process.cwd(), stdio: 'inherit' });
    startServe();
    await waitForServer();
  });

  test.afterAll(() => stopServe());

  test('renders review pages correctly', async ({ page }) => {
    const slugs = exportedReviewSlugs();
    expect(slugs.length).toBeGreaterThan(0);

    for (const slug of slugs) {
      await test.step(`review: ${slug}`, async () => {
        await page.goto(`${BASE_URL}/reviews/${slug}/`);

        // Article should be visible (CSS modules hash the class name)
        const article = page.locator('article[class*="reviewPage"]');
        await expect(article).toBeVisible();

        // Exactly one <h1>
        const h1s = article.locator('h1');
        await expect(h1s).toHaveCount(1);
        expect((await h1s.first().textContent())?.trim()).not.toBe('');

        // Footer appears once
        const footer = page.locator('[class*="MainLayout_footer__"]');
        await expect(footer).toHaveCount(1);
      });
    }
  });

  test('overall score matches the weighted formula, computed independently', async ({ page }) => {
    const slugs = exportedReviewSlugs();

    for (const slug of slugs) {
      await test.step(`weighted math: ${slug}`, async () => {
        await page.goto(`${BASE_URL}/reviews/${slug}/`);

        const headerScore = page.locator('[class*="overallScore"]');
        await expect(headerScore).toBeVisible();
        const headerText = (await headerScore.first().textContent()) ?? '';
        const shown = Number(headerText.match(/([0-9]+\.[0-9])\/10/)?.[1]);

        // Parse the breakdown table and recompute Σ(score×weight)/Σweight.
        const table = page.locator('section:has-text("The ensemble scorecard") table');
        const rows = table.locator('tbody tr');
        await rows.first().waitFor();
        const rowCount = await rows.count();
        // Last tbody row is the computed total.
        expect(rowCount).toBeGreaterThan(1);
        let weightedSum = 0;
        let weightSum = 0;
        for (let i = 0; i < rowCount - 1; i++) {
          const cells = rows.nth(i).locator('td');
          const score = Number((await cells.nth(1).textContent())?.replace('/10', ''));
          const weight = Number((await cells.nth(2).textContent())?.replace('%', '')) / 100;
          weightedSum += score * weight;
          weightSum += weight;
        }
        const expected = Math.round((weightedSum / weightSum) * 10) / 10;
        expect(shown).toBe(expected);

        // The computed total row repeats the same value.
        const totalCell = page.locator('[class*="totalRow"] td').last();
        expect((await totalCell.textContent())?.trim()).toBe(`${expected}/10`);
      });
    }
  });

  test('review page shows disclosure and product links with correct rel', async ({ page }) => {
    // ErgoKing Pro's disclaimer indicates a supplied/reviewed-at-discount unit.
    await page.goto(`${BASE_URL}/reviews/2026-09-22-ergoking-pro/`);
    const disclosure = page.locator('[class*="disclaimer"]');
    await expect(disclosure).toBeVisible();
    await expect(disclosure).toContainText(/supplied|discount|independen/i);

    // Scoped to the links section: other external links (e.g. a Google Maps
    // "Where"-line link) exist elsewhere on the page and are not product links.
    const productLink = page.locator('div[class*="_links__"] a[target="_blank"]').first();
    await expect(productLink).toBeVisible();
    expect(await productLink.getAttribute('rel')).toContain('nofollow');
    expect(await productLink.getAttribute('rel')).toContain('sponsored');

    await page.goto(`${BASE_URL}/reviews/2026-10-17-the-royal-cuck-chair-2-0/`);
    const plainLink = page.locator('div[class*="_links__"] a[target="_blank"]').first();
    expect(await plainLink.getAttribute('rel')).not.toContain('sponsored');
  });

  test('category (tag) pages are reachable from tag chips', async ({ page }) => {
    // Every declared tag must resolve to a page that lists reviews.
    for (const tag of ['gaming', 'office']) {
      await page.goto(`${BASE_URL}/tags/${tag}/`);
      const cards = page.locator('.reviewCard');
      await expect(cards.first()).toBeVisible();
      expect(await cards.count()).toBeGreaterThan(0);
    }

    // Chips in the directory link through to a tag page.
    await page.goto(`${BASE_URL}/reviews/`);
    await page.locator('a.reviewTag[href*="/tags/"]').first().click();
    await page.waitForURL('**/tags/**');
    expect(new URL(page.url()).pathname.startsWith('/tags/')).toBe(true);
  });

  test('compare flow: select two chairs in directory, table shows both', async ({ page }) => {
    await page.goto(`${BASE_URL}/reviews/`, { waitUntil: 'networkidle' });

    const boxes = page.locator('.compareCheck input[type="checkbox"]');
    await boxes.first().check();
    await boxes.nth(1).check();

    const compareButton = page.locator('a.compareBarBtn');
    const href = await compareButton.getAttribute('href');
    expect(href).toContain('/compare/?ids=');

    await compareButton.click();
    await page.waitForURL('**/compare/**');
    expect(new URL(page.url()).pathname).toBe('/compare/');

    await page.locator('td.compareScore').first().waitFor();
    const overallCells = page.locator('td.compareScore');
    expect(await overallCells.count()).toBe(2);
    for (let i = 0; i < 2; i++) {
      expect((await overallCells.nth(i).textContent())?.trim()).toMatch(/^[0-9]+\.[0-9]\/10$/);
    }
  });

  test('cuckguessr: intro, one answered round and reveal', async ({ page }) => {
    await page.goto(`${BASE_URL}/games/cuckguessr/`);
    await page.locator('button:has-text("Start the game")').click();

    const firstFieldset = page.locator('fieldset').first();
    await firstFieldset.locator('button').first().click();

    // Optional brand question, if present for this round.
    if ((await page.locator('fieldset').count()) > 1) {
      await page.locator('fieldset').nth(1).locator('button').first().click();
    }

    await expect(page.locator('button:has-text("Next round"), button:has-text("See the verdict")').first()).toBeVisible();

    // The reveal names the correct location after guessing.
    await expect(page.locator('[class*="_reveal__"]')).toBeVisible();
  });

  test('compare page without a selection is a clean directory pointer', async ({ page }) => {
    await page.goto(`${BASE_URL}/compare/`);

    // No residual picker: selection starts in the review directory only.
    await expect(page.locator('.compareAdd, .compareActions select')).toHaveCount(0);

    const emptyState = page.locator('.compareEmpty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('review directory');

    // No table until a selection exists.
    await expect(page.locator('table.compareTable')).toHaveCount(0);
  });

  test('cuckguessr: deck includes review-archive rounds with venue data', async ({ page }) => {
    // Count located reviews (and those shipping a Maps URL) straight from the
    // frontmatter so the deck assertions track the content-driven feature.
    const reviewsDir = path.join(process.cwd(), 'content', 'reviews');
    const reviewFiles = fs.readdirSync(reviewsDir).filter((f) => f.endsWith('.md'));
    const frontmatterOf = (f: string) => fs.readFileSync(path.join(reviewsDir, f), 'utf-8');
    const located = reviewFiles.filter((f) => new RegExp('^location:', 'm').test(frontmatterOf(f)));
    const withMaps = located.filter((f) =>
      new RegExp('^\\s+map: https://(www\\.google\\.[a-z.]+/maps|maps\\.app\\.goo\\.gl)', 'm').test(frontmatterOf(f))
    );

    await page.goto(`${BASE_URL}/games/cuckguessr/`);
    await page.locator('button:has-text("Start the game")').click();

    let archiveRounds = 0;
    let mapReveals = 0;
    for (let round = 1; round <= 6; round++) {
      await page.locator('fieldset').first().locator('button').first().click();
      // Optional brand question, when this round names an establishment.
      if ((await page.locator('fieldset').count()) > 1) {
        await page.locator('fieldset').nth(1).locator('button').first().click();
      }
      if ((await page.locator('[class*="archiveBadge"]').count()) > 0) archiveRounds += 1;
      if ((await page.locator('[class*="revealMapLink"]').count()) > 0) mapReveals += 1;
      await page
        .locator('button:has-text("Next round"), button:has-text("See the verdict")')
        .first()
        .click();
    }

    expect(archiveRounds).toBe(Math.min(located.length, 6));
    expect(mapReveals).toBe(Math.min(withMaps.length, 6));
  });

  test('theme selector: vigil gate + vibe preset and accent persist', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // Hidden until the vigil is unlocked: no switcher controls at all.
    await expect(page.locator('button:has-text("Brutalist")')).toHaveCount(0);

    // Enter the Konami code on real key events to reveal the switcher.
    for (const key of ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']) {
      await page.keyboard.press(key);
    }
    await expect(page.locator('button:has-text("Brutalist")')).toHaveCount(1);

    // Switch to brutalist + mint, then reload: attributes must survive on <html>.
    await page.locator('button:has-text("Brutalist")').first().click();
    await page.locator('button[aria-label="Mint color"]').click();
    await page.reload();

    await expect(page.locator('html[data-theme="brutalist"]')).toHaveCount(1);
    await expect(page.locator('html[data-accent="mint"]')).toHaveCount(1);

    // The accent token the palette layer exposes must actually swap.
    const accent = await page.evaluate(
      () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    );
    expect(accent).not.toBe('#fbbf24');

    // All three presets are selectable at the switcher level.
    await page.locator('button:has-text("SaaS")').first().click();
    await expect(page.locator('html[data-theme="saas"]')).toHaveCount(1);
    await page.locator('button:has-text("Editorial")').first().click();
    await expect(page.locator('html[data-theme="editorial"]')).toHaveCount(1);

    // The unlock itself persisted across the reload above: the switcher is
    // still there without re-entering the code.
    await expect(page.locator('button:has-text("Brutalist")')).toHaveCount(1);
  });
});
