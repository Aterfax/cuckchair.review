import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface CategoryScore {
  name: string;
  score: number;
}

export interface ReviewMetric {
  name: string;
  /** Fraction of 1 (e.g. 0.15 = 15%). */
  weight: number;
  evaluation: string;
}

/**
 * The canonical scoring model, and the single source of truth for
 * methodology, review loading, and the weighted score computation.
 *
 * The unit of review is the whole setup: the cuck chair, the room it sits
 * in, and its position within that room. Each metric is scored 0-10 in the
 * frontmatter and applied with the weight below.
 *
 * Weights must total exactly 1 (100%).
 */
export const METRICS: ReviewMetric[] = [
  {
    name: 'Position and sightlines',
    weight: 0.22,
    evaluation:
      'Where the seat sits in the room: distance and angle to the action, unobstructed sightlines, and how long the view stays usable.',
  },
  {
    name: 'Room presence',
    weight: 0.12,
    evaluation:
      'How the setup looks and belongs: design, finish, and whether chair and room read as one deliberate ensemble.',
  },
  {
    name: 'Comfort for the session',
    weight: 0.12,
    evaluation:
      'Comfort of the whole dwell — seating, posture, and the room around it (climate, noise, light) over a long session.',
  },
  {
    name: 'Workspace and devices',
    weight: 0.12,
    evaluation:
      'Room-equipped practical space for phones, laptops, peripherals, and accessories within reach of the seat.',
  },
  {
    name: 'Audio in the room',
    weight: 0.08,
    evaluation:
      'The listening position, not just the speaker: reflections, noise bleed, and equipment placement relative to the seat.',
  },
  {
    name: 'Build and stability',
    weight: 0.08,
    evaluation:
      'Materials, construction, and stability of the chair as the fixed anchor of the arrangement.',
  },
  {
    name: 'Power and practicality',
    weight: 0.08,
    evaluation:
      'Room realities: power access, cable routing, walkways, and everything that keeps the positioning workable.',
  },
  {
    name: 'Room dynamics and layout',
    weight: 0.08,
    evaluation:
      'Footprint relative to functionality and how the arrangement works as a room: door lines, light, sightline flow.',
  },
  {
    name: 'Customisation and adaptability',
    weight: 0.05,
    evaluation:
      'How flexibly the setup adapts: chair adjustability, accessories, and easy repositioning inside the room.',
  },
  {
    name: 'Value for the setup',
    weight: 0.05,
    evaluation:
      'What this chair does for the whole ensemble relative to its price.',
  },
];

const METRIC_BY_NAME = new Map(METRICS.map((m) => [m.name, m]));

const TOTAL_WEIGHT = METRICS.reduce((sum, m) => sum + m.weight, 0);
if (Math.abs(TOTAL_WEIGHT - 1) > 1e-9) {
  throw new Error(`Metric weights must total 1 (got ${TOTAL_WEIGHT})`);
}

export interface ReviewLink {
  name: string;
  url: string;
}

export interface ReviewSpec {
  label: string;
  value: string;
}

export interface ReviewImage {
  src: string;
  alt: string;
}

/**
 * Optional where-was-it metadata. Drives the review page's "Where" line and
 * the CuckGuessr game's location round: `setting` is the game's location
 * answer, `venue` its optional brand answer.
 */
export interface ReviewLocation {
  /** Guessable kind of place, e.g. "Boutique hotel suite, high floor". */
  setting: string;
  /** Identifiable establishment, e.g. "Hotel Meridian". */
  venue?: string;
  /** Short human-readable geography line, e.g. "Lisbon, Portugal". */
  place?: string;
  /** Google Maps URL (www.google.<tld>/maps or maps.app.goo.gl) for the reveal. */
  map?: string;
  /** One-line scene description, used as the game image's alt text. */
  scene?: string;
}

export interface ReviewMeta {
  title: string;
  slug: string;
  date: string; // ISO
  updated?: string | null; // ISO, present after a material content update
  author: string;
  /** Weighted overall score, computed from category scores and metric weights. */
  overallScore: number;
  categories: CategoryScore[];
  /** Metrics named here are excluded and the remaining weights renormalised. */
  excludes?: string[];
  tags?: string[];
  images?: ReviewImage[];
  location?: ReviewLocation;
  disclaimer?: string;
  /**
   * True when the product was supplied, gifted, discounted or sponsored.
   * Deterministic alternative to scanning disclaimer prose; drives the
   * rel="sponsored" attribute on review links.
   */
  commercial?: boolean;
  links?: ReviewLink[];
  specs?: ReviewSpec[];
}

export interface Review extends ReviewMeta {
  content: string;
}

const REVIEWS_DIR = path.join(process.cwd(), 'content', 'reviews');

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^[-]+|[-]+$/g, '');
}

export function normalizeDate(value: unknown): string {
  const date: string = value instanceof Date ? value.toISOString() : String(value ?? '');
  return date;
}

function assertValidDate(iso: string, label: string, file: string): void {
  if (Number.isNaN(new Date(iso).getTime())) {
    throw new Error(`${file}: ${label} is not a valid date ("${iso}")`);
  }
}

/**
 * Weighted overall score per the published methodology:
 *
 *   overall = Σ(category score × weight) / Σ(applied weights)
 *
 * Excluded metrics are dropped from the sum and the remaining weights are
 * renormalised by the denominator. The result is rounded to one decimal.
 */
export function computeWeightedScore(
  categories: CategoryScore[],
  excludes: string[] = []
): {
  score: number;
  /** Applied weights, for a transparent breakdown. */
  applied: Array<{ name: string; score: number; weight: number; contribution: number }>;
  /** Metrics excluded for this review, with their renormalised weights. */
  excluded: Array<{ name: string; weight: number }>;
} {
  const excludeSet = new Set(
    excludes.filter((name) => {
      if (!METRIC_BY_NAME.has(name)) {
        throw new Error(`Unknown excluded metric: "${name}"`);
      }
      return true;
    })
  );

  const applied: Array<{ name: string; score: number; weight: number; contribution: number }> = [];
  const excluded: Array<{ name: string; weight: number }> = [];
  let weightedSum = 0;
  let appliedWeight = 0;

  for (const metric of METRICS) {
    if (excludeSet.has(metric.name)) {
      excluded.push({ name: metric.name, weight: metric.weight });
      continue;
    }
    const category = categories.find((c) => c.name === metric.name);
    if (!category) {
      throw new Error(`Missing category score for metric: "${metric.name}"`);
    }
    const contribution = category.score * metric.weight;
    applied.push({ name: metric.name, score: category.score, weight: metric.weight, contribution });
    weightedSum += contribution;
    appliedWeight += metric.weight;
  }

  const score = appliedWeight > 0 ? Math.round((weightedSum / appliedWeight) * 10) / 10 : 0;
  return { score, applied, excluded };
}

function validateCategories(categories: unknown, source: string): CategoryScore[] {
  if (!Array.isArray(categories)) {
    throw new Error(`${source}: "categories" must be a list of { name, score }`);
  }
  const seen = new Set<string>();
  for (const category of categories) {
    const { name, score } = category as CategoryScore;
    if (typeof name !== 'string' || !METRIC_BY_NAME.has(name)) {
      throw new Error(`${source}: unknown category name "${name}" (use the published metric names)`);
    }
    if (seen.has(name)) {
      throw new Error(`${source}: duplicate category "${name}"`);
    }
    seen.add(name);
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 10) {
      throw new Error(
        `${source}: category "${name}" score must be a finite number between 0 and 10`
      );
    }
  }
  return categories as CategoryScore[];
}

const MAP_URL_RE = /^https:\/\/(www\.google\.[a-z.]+\/maps|maps\.app\.goo\.gl)\//i;

/**
 * Optional `location` block. Every field except `setting` may be omitted, but
 * present fields must be non-empty strings, and `map` — when set — must point
 * at Google Maps so the game's reveal link stays a trustworthy, external URL.
 */
function validateLocation(raw: unknown, file: string): ReviewLocation | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`${file}: "location" must be a mapping with a "setting" field`);
  }
  const loc = raw as Record<string, unknown>;
  const stringField = (label: string): string | undefined => {
    const value = loc[label];
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`${file}: "location.${label}" must be a non-empty string when present`);
    }
    return value.trim();
  };
  if (typeof loc.setting !== 'string' || !loc.setting.trim()) {
    throw new Error(`${file}: "location.setting" is required and must be a non-empty string`);
  }
  const map = stringField('map');
  if (map && !MAP_URL_RE.test(map)) {
    throw new Error(
      `${file}: "location.map" must be an https Google Maps URL (www.google.*/maps or maps.app.goo.gl)`
    );
  }
  return {
    setting: loc.setting.trim(),
    venue: stringField('venue'),
    place: stringField('place'),
    map,
    scene: stringField('scene'),
  };
}

export function loadAllReviews(): Review[] {
  const files = fs.readdirSync(REVIEWS_DIR).filter((f) => f.endsWith('.md'));
  const reviews: Review[] = [];
  for (const file of files) {
    const filePath = path.join(REVIEWS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw) as { data: any; content: string };

    if (!data.title || !data.author || !data.date) {
      throw new Error(`${file}: "title", "author" and "date" are required in frontmatter`);
    }
    if (data.overallScore !== undefined) {
      throw new Error(
        `${file}: "overallScore" is computed from category scores and weights — remove it from frontmatter`
      );
    }

    const date = normalizeDate(data.date);
    assertValidDate(date, '"date"', file);
    const updated = data.updated ? normalizeDate(data.updated) : null;
    if (updated) {
      assertValidDate(updated, '"updated"', file);
    }
    const categories = validateCategories(data.categories ?? [], file);
    const location = validateLocation(data.location, file);

    if (data.commercial !== undefined && typeof data.commercial !== 'boolean') {
      throw new Error(`${file}: "commercial" must be true or false`);
    }
    if (Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        if (typeof tag !== 'string' || !/^[a-z0-9-]+$/.test(tag)) {
          throw new Error(
            `${file}: tag "${tag}" must use lowercase letters, digits, or hyphens`
          );
        }
      }
    }

    // Generate slug if missing
    let slug: string;
    if (data.slug) {
      slug = data.slug;
    } else {
      const datePart = date.split('T')[0] ?? '';
      const titleSlug = slugify(data.title);
      slug = `${datePart}-${titleSlug}`.replace(/-+/g, '-').replace(/^-|-$/g, '');
    }

    const { score } = computeWeightedScore(categories, data.excludes ?? []);

    reviews.push({
      title: data.title,
      slug,
      date,
      updated,
      author: data.author,
      overallScore: score,
      categories,
      excludes: data.excludes,
      tags: data.tags,
      images: data.images,
      location,
      disclaimer: data.disclaimer,
      commercial: data.commercial,
      links: data.links,
      specs: data.specs,
      content,
    });
  }
  return reviews;
}

export function findReviewBySlug(slug: string): Review | undefined {
  const all = loadAllReviews();
  return all.find((r) => r.slug === slug);
}

/** Reviews sharing at least one tag, highest overall score first. */
export function findRelatedReviews(review: Review, limit = 3): Review[] {
  const tags = new Set((review.tags ?? []).map((t) => t.toLowerCase()));
  return loadAllReviews()
    .filter((r) => r.slug !== review.slug)
    .map((r) => ({
      review: r,
      shared: (r.tags ?? []).filter((t) => tags.has(t.toLowerCase())).length,
    }))
    .filter((r) => r.shared > 0)
    .sort((a, b) => b.shared - a.shared || b.review.overallScore - a.review.overallScore)
    .slice(0, limit)
    .map((r) => r.review);
}

/** All tags used across reviews, alphabetically. */
export function collectTags(): string[] {
  return Array.from(
    new Set(loadAllReviews().flatMap((r) => (r.tags ?? []).map((t) => t.toLowerCase())))
  ).sort();
}

export function findReviewsByTag(tag: string): Review[] {
  const wanted = tag.toLowerCase();
  return loadAllReviews()
    .filter((r) => (r.tags ?? []).some((t) => t.toLowerCase() === wanted))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}
