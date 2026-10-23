'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BASE_URL = 'https://cuckchair.review';
const reviewsDir = path.join(process.cwd(), 'content', 'reviews');
const outDir = path.join(process.cwd(), 'out');
function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^[-]+|[-]+$/g, '');
}

function reviewSlug(data) {
  if (data.slug) return data.slug;
  const datePart =
    data.date && data.date.toISOString
      ? data.date.toISOString().split('T')[0]
      : String(data.date || '').split('T')[0];
  const titleSlug = slugify(data.title);
  return `${datePart}-${titleSlug}`.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function lastmod(data) {
  // The latest of the review date and any post-publication update.
  const candidates = [data.date, data.updated]
    .filter((d) => d)
    .map((d) => (d instanceof Date ? d : new Date(String(d))))
    .filter((d) => !Number.isNaN(d.getTime()));
  if (candidates.length === 0) return new Date();
  return candidates.reduce((a, b) => (a.getTime() > b.getTime() ? a : b));
}

const files = fs.readdirSync(reviewsDir).filter((f) => f.endsWith('.md'));
const reviews = [];
const tags = new Set();
for (const file of files) {
  const { data } = matter(fs.readFileSync(path.join(reviewsDir, file), 'utf-8'));
  reviews.push({ slug: reviewSlug(data), lastmod: lastmod(data) });
  for (const tag of data.tags ?? []) tags.add(String(tag).toLowerCase());
}

const urls = [
  { url: BASE_URL, lastmod: new Date(), changefreq: 'weekly', priority: 1 },
  {
    url: `${BASE_URL}/reviews/`,
    lastmod: new Date(),
    changefreq: 'weekly',
    priority: 0.8,
  },
  ...reviews.map((r) => ({
    url: `${BASE_URL}/reviews/${r.slug}/`,
    lastmod: r.lastmod,
    changefreq: 'monthly',
    priority: 0.7,
  })),
  ...Array.from(tags).sort().map((tag) => ({
    url: `${BASE_URL}/tags/${tag}/`,
    lastmod: new Date(),
    changefreq: 'monthly',
    priority: 0.6,
  })),
  {
    url: `${BASE_URL}/compare/`,
    lastmod: new Date(),
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/games/`,
    lastmod: new Date(),
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    url: `${BASE_URL}/games/cuckguessr/`,
    lastmod: new Date(),
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    url: `${BASE_URL}/methodology/`,
    lastmod: new Date(),
    changefreq: 'yearly',
    priority: 0.5,
  },
  {
    url: `${BASE_URL}/disclosures/`,
    lastmod: new Date(),
    changefreq: 'yearly',
    priority: 0.3,
  },
];

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map(
      (u) =>
        `  <url><loc>${u.url}</loc><lastmod>${u.lastmod.toISOString()}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
    )
    .join('\n') +
  '\n</urlset>\n';

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml);
console.log(`Generated sitemap.xml with ${reviews.length} review URLs`);
