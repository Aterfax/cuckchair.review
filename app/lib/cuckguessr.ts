/**
 * CuckGuessr round data.
 *
 * Rounds come from two sources: `buildRounds` derives one guessable round per
 * review that ships the optional `location` frontmatter block, and the six
 * fictional placeholder scenes below fill the rest of the deck — invented
 * establishments that also serve as the distractor pools while the review
 * archive grows. Fictional scene art lives in public/assets/cuckguessr/.
 */
import type { Review } from './reviews';

export interface GameRound {
  id: string;
  image: string;
  alt: string;
  location: string;
  options: string[];
  /** Fictional establishment brand, when one is identifiable in the scene. */
  brand?: string;
  brandOptions?: string[];
  /** Reveal copy shown after guessing. */
  flavor: string;
  /** True for rounds derived from a review's location metadata. */
  fromArchive?: boolean;
  /** Short geography line shown on reveal, e.g. "Lisbon, Portugal". */
  place?: string;
  /** Google Maps URL revealed after guessing, when the review ships one. */
  mapUrl?: string;
}

export const FICTIONAL_ROUNDS: GameRound[] = [
  {
    id: 'skyline',
    image: '/assets/cuckguessr/skyline.svg',
    alt: 'A cuck chair beside a floor-to-ceiling window overlooking a night city skyline',
    location: 'Urban luxury hotel suite, high floor',
    options: ['Urban luxury hotel suite, high floor', 'Cruise ship cabin', 'Desert motel by a highway', 'Wooden chalet lounge'],
    brand: 'Hotel Meridian',
    brandOptions: ['Hotel Meridian', 'Coral Line Cruises', 'The Compass Motel', 'Pine Crest Chalet'],
    flavor:
      'A floor-to-ceiling overlook with nothing but glass, and buildings stacked to the horizon. Chair scores points for the panorama and for the discreet, desk-like layout.',
  },
  {
    id: 'lakeside',
    image: '/assets/cuckguessr/lakeside.svg',
    alt: 'A cuck chair facing tall windows above a still alpine lake',
    location: 'Lakeside spa resort with a room-view lounge',
    options: ['Recording studio green room', 'Lakeside spa resort with a room-view lounge', 'Cruise ship cabin', 'Urban luxury hotel suite, high floor'],
    brand: 'Grand Lac Resort',
    brandOptions: ['Grand Lac Resort', 'Pine Crest Chalet', 'Hotel Meridian', 'Echo Park Soundstage'],
    flavor:
      'Flat water, tree-lined shore, and a lounge angle tuned to the entire shoreline. Excellent sightlines; the view does half the entertaining.',
  },
  {
    id: 'cabin',
    image: '/assets/cuckguessr/cabin.svg',
    alt: 'A cuck chair in a compact cabin with a round porthole and water beyond',
    location: 'Cruise ship cabin near the waterline',
    options: ['Ski chalet lobby', 'Cruise ship cabin near the waterline', 'Desert motel by a highway', 'Lakeside spa resort with a room-view lounge'],
    brand: 'Coral Line Cruises',
    brandOptions: ['Coral Line Cruises', 'The Compass Motel', 'Grand Lac Resort', 'Hotel Meridian'],
    flavor:
      'A porthole that round, all teak trim… and a chair wedged where the second suitcase should be. Compact and marine-stable: chair wobble takes on a whole new meaning in rough seas.',
  },
  {
    id: 'desert',
    image: '/assets/cuckguessr/desert.svg',
    alt: 'A cuck chair on red desert sand with a neon pool sign glowing',
    location: 'Desert motel, poolside wing',
    options: ['Urban luxury hotel suite, high floor', 'Desert motel, poolside wing', 'Recording studio green room', 'Lakeside spa resort with a room-view lounge'],
    brand: 'The Compass Motel',
    brandOptions: ['The Compass Motel', 'Coral Line Cruises', 'Pine Crest Chalet', 'Echo Park Soundstage'],
    flavor:
      'Single-story blocks, sand tones, and barbed neon promising water. Budget comfort: viewing angle superb, build quality … roadside.',
  },
  {
    id: 'studio',
    image: '/assets/cuckguessr/studio.svg',
    alt: 'A cuck chair parked in the corner of a dim recording studio lounge',
    location: 'Recording studio lounge, dimmable lighting',
    options: ['Cruise ship cabin near the waterline', 'Recording studio lounge, dimmable lighting', 'Wooden chalet lounge', 'Urban luxury hotel suite, high floor'],
    brand: 'Echo Park Soundstage',
    brandOptions: ['Echo Park Soundstage', 'Hotel Meridian', 'The Compass Motel', 'Grand Lac Resort'],
    flavor:
      'Violet mood light, patchbay glow, one speaker towering beyond. Probably the best audio seat on this list — though it is a 6 on aesthetics by reviewer consensus.',
  },
  {
    id: 'chalet',
    image: '/assets/cuckguessr/chalet.svg',
    alt: 'A cuck chair beside snow-capped peaks framed by wooden beams',
    location: 'Mountain chalet lounge with snow outside',
    options: ['Desert motel, poolside wing', 'Wooden chalet lounge with snow outside', 'Urban luxury hotel suite, high floor', 'Cruise ship cabin near the waterline'],
    brand: 'Pine Crest Chalet',
    brandOptions: ['Pine Crest Chalet', 'Grand Lac Resort', 'Echo Park Soundstage', 'Coral Line Cruises'],
    flavor:
      'All intersecting timber and snow on the rooftree. Heated underfoot but a detour to the fireplace makes the viewing position secondary tonight.',
  },
];

/** Distractor pools, sourced from the fictional scenes' answers. */
const FICTIONAL_SETTINGS = FICTIONAL_ROUNDS.map((r) => r.location);
const FICTIONAL_BRANDS = FICTIONAL_ROUNDS.map((r) => r.brand).filter((b): b is string => Boolean(b));

/**
 * Deterministic distractor pick — the build must stay reproducible, so no
 * randomness. Alternates real and fictional candidates and skips anything
 * equivalent to the correct answer (case/whitespace-insensitive).
 */
function distractors(correct: string, realSources: string[], fictionalSources: string[], count: number): string[] {
  const norm = (s: string) => s.trim().toLowerCase();
  const used = new Set<string>([norm(correct)]);
  const real = realSources.filter((s) => Boolean(s) && !used.has(norm(s)));
  const fictional = fictionalSources.filter((s) => Boolean(s) && !used.has(norm(s)));
  const picked: string[] = [];
  let turn = 0;
  while (picked.length < count && (real.length > 0 || fictional.length > 0)) {
    const pool = turn % 2 === 0 && real.length > 0 ? real : fictional;
    const candidate = pool.shift();
    if (candidate !== undefined && !used.has(norm(candidate))) {
      used.add(norm(candidate));
      picked.push(candidate);
    }
    turn++;
  }
  return picked;
}

/** Rotate option lists deterministically by round id so the correct answer does not always sit in the first slot. */
function rotate(items: string[], by: number): string[] {
  const k = items.length;
  const start = ((by % k) + k) % k;
  return [...items.slice(start), ...items.slice(0, start)];
}

/**
 * One guessable round per review shipping a `location` block plus its first
 * image, capped at the six-slot deck, with fictional scenes filling the rest.
 * Runs at build: deterministic, no side effects. Throws loudly (failing the
 * build gate) if a review round cannot be supplied with four options.
 */
export function buildRounds(reviews: Review[]): GameRound[] {
  const located = reviews.filter((r) => r.location && r.images && r.images.length > 0);
  const realSettings = located.map((r) => r.location!.setting);
  const realVenues = located
    .map((r) => r.location!.venue)
    .filter((v): v is string => Boolean(v));

  const reviewRounds: GameRound[] = located.map((r) => {
    const loc = r.location!;
    const options = rotate(
      [loc.setting, ...distractors(loc.setting, realSettings, FICTIONAL_SETTINGS, 3)],
      r.slug.length
    );
    if (options.length !== 4) {
      throw new Error(`cuckguessr: review ${r.slug} could not be given 4 location options`);
    }
    let brandOptions: string[] | undefined;
    if (loc.venue) {
      brandOptions = [loc.venue, ...distractors(loc.venue, realVenues, FICTIONAL_BRANDS, 3)];
      if (brandOptions.length !== 4) {
        throw new Error(`cuckguessr: review ${r.slug} could not be given 4 brand options`);
      }
      brandOptions = rotate(brandOptions, r.slug.length);
    }
    return {
      id: `review-${r.slug}`,
      image: r.images![0].src,
      alt: loc.scene ?? r.images![0].alt,
      location: loc.setting,
      options,
      brand: loc.venue,
      brandOptions,
      flavor: `${loc.venue ?? loc.setting} — reviewed by ${r.author}, overall score ${r.overallScore}/10.`,
      fromArchive: true,
      place: loc.place,
      mapUrl: loc.map,
    };
  });

  const archived = reviewRounds.slice(0, FICTIONAL_ROUNDS.length);
  const fill = Math.max(0, FICTIONAL_ROUNDS.length - archived.length);
  return [...archived, ...FICTIONAL_ROUNDS.slice(0, fill)];
}
