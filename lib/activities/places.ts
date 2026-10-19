// The stops on Israel's journey for the Where in the Wilderness game, in the order they
// were reached. Most sites are uncertain; the coordinates follow the
// traditional southern route through the Sinai (Numbers 33). A `region` is a
// wilderness rather than a camp, drawn as a faint area around its point.

import { MAP_BOUNDS, MAP_HEIGHT, MAP_WIDTH } from "./sinai-map";

export type Clue = { text: string; ref: string };

export type Place = {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  /** Size of the drawn area, in map units, for a wilderness. */
  region?: { rx: number; ry: number };
  /** Where the label sits relative to the point. */
  label: { dx: number; dy: number; anchor: "start" | "middle" | "end" };
  clues: Clue[];
};

export const PLACES: Place[] = [
  {
    slug: "succoth",
    name: "Succoth",
    lat: 30.55,
    lon: 32.1,
    label: { dx: -12, dy: -10, anchor: "end" },
    clues: [{ text: "Sanctify the firstborn", ref: "Exodus 13:1–2" }],
  },
  {
    slug: "etham",
    name: "Etham",
    lat: 30.47,
    lon: 32.43,
    label: { dx: 12, dy: -8, anchor: "start" },
    clues: [
      { text: "Fortress", ref: "Name meaning" },
      { text: "Pillar of cloud and pillar of fire", ref: "Exodus 13:21–22" },
    ],
  },
  {
    slug: "pihahiroth",
    name: "Pihahiroth",
    lat: 30.06,
    lon: 32.36,
    label: { dx: -12, dy: 5, anchor: "end" },
    clues: [
      { text: "Many reeds", ref: "Name meaning" },
      { text: "The people wavered as Egypt pursued", ref: "Exodus 14:10–12" },
    ],
  },
  {
    slug: "red-sea",
    name: "Red Sea crossing",
    lat: 29.86,
    lon: 32.57,
    label: { dx: -12, dy: 18, anchor: "end" },
    clues: [
      { text: "Water baptism", ref: "1 Corinthians 10:1–2" },
      { text: "Crossed on dry ground", ref: "Exodus 14:22" },
      { text: "A song of victory", ref: "Exodus 15:1" },
    ],
  },
  {
    slug: "shur",
    name: "Wilderness of Shur",
    lat: 30.2,
    lon: 33.05,
    region: { rx: 95, ry: 55 },
    label: { dx: 0, dy: -64, anchor: "middle" },
    clues: [{ text: "Separation from the world", ref: "Lesson 3" }],
  },
  {
    slug: "marah",
    name: "Marah",
    lat: 29.45,
    lon: 32.88,
    label: { dx: -12, dy: 5, anchor: "end" },
    clues: [
      { text: "Bitter", ref: "Name meaning" },
      { text: "A tree made the water sweet", ref: "Exodus 15:25" },
      { text: "God our healer", ref: "Exodus 15:26" },
    ],
  },
  {
    slug: "elim",
    name: "Elim",
    lat: 29.2,
    lon: 33.03,
    label: { dx: -12, dy: 5, anchor: "end" },
    clues: [
      { text: "An oasis", ref: "Exodus 15:27" },
      { text: "12 wells and 70 palm trees", ref: "Exodus 15:27" },
    ],
  },
  {
    slug: "sin",
    name: "Wilderness of Sin",
    lat: 28.86,
    lon: 33.27,
    region: { rx: 40, ry: 50 },
    label: { dx: -46, dy: 5, anchor: "end" },
    clues: [{ text: "The first manna", ref: "Exodus 16:4, 14–15" }],
  },
  {
    slug: "dophkah",
    name: "Dophkah",
    lat: 29.05,
    lon: 33.46,
    label: { dx: 12, dy: -6, anchor: "start" },
    clues: [
      { text: "Knocking", ref: "Name meaning" },
      { text: "Persistent prayer", ref: "Matthew 7:7" },
    ],
  },
  {
    slug: "alush",
    name: "Alush",
    lat: 28.86,
    lon: 33.57,
    label: { dx: 12, dy: -4, anchor: "start" },
    clues: [
      { text: "Near water", ref: "Name meaning" },
      { text: "Meditating on God’s Word", ref: "Lesson 3" },
    ],
  },
  {
    slug: "rephidim",
    name: "Rephidim",
    lat: 28.7,
    lon: 33.66,
    label: { dx: 12, dy: 10, anchor: "start" },
    clues: [
      { text: "Strike the rock for water", ref: "Exodus 17:6" },
      { text: "Amalek attacked", ref: "Exodus 17:8" },
    ],
  },
  {
    slug: "sinai",
    name: "Wilderness of Sinai",
    lat: 28.54,
    lon: 33.97,
    region: { rx: 52, ry: 40 },
    label: { dx: 0, dy: 58, anchor: "middle" },
    clues: [
      { text: "The Lord descended in fire on the mountain", ref: "Exodus 19:18" },
      { text: "Baptism of the Holy Spirit", ref: "Acts 2:1–4" },
      { text: "The Ten Commandments", ref: "Exodus 20" },
      { text: "The priesthood began", ref: "Exodus 28:1" },
      { text: "The tabernacle was built", ref: "Exodus 40:17" },
    ],
  },
  {
    slug: "taberah",
    name: "Taberah",
    lat: 28.72,
    lon: 34.06,
    label: { dx: -12, dy: -6, anchor: "end" },
    clues: [
      { text: "Burning", ref: "Name meaning" },
      { text: "Fire on the edge of the camp", ref: "Numbers 11:1" },
    ],
  },
  {
    slug: "kibroth-hattaavah",
    name: "Kibroth-hattaavah",
    lat: 28.78,
    lon: 34.22,
    label: { dx: 12, dy: 5, anchor: "start" },
    clues: [
      { text: "They despised the manna", ref: "Numbers 11:6" },
      { text: "They lusted after meat", ref: "Numbers 11:4" },
      { text: "A plague while eating quail", ref: "Numbers 11:33" },
    ],
  },
  {
    slug: "hazeroth",
    name: "Hazeroth",
    lat: 28.98,
    lon: 34.43,
    label: { dx: 12, dy: 5, anchor: "start" },
    clues: [
      { text: "Miriam and Aaron spoke against Moses", ref: "Numbers 12:1" },
      { text: "Miriam became leprous", ref: "Numbers 12:10" },
    ],
  },
  {
    slug: "paran",
    name: "Wilderness of Paran",
    lat: 29.95,
    lon: 34.15,
    region: { rx: 105, ry: 80 },
    label: { dx: 0, dy: 5, anchor: "middle" },
    clues: [
      { text: "Twelve spies sent", ref: "Numbers 13:1–3" },
      { text: "Korah’s rebellion", ref: "Numbers 16:31–32" },
      { text: "Aaron’s rod budded", ref: "Numbers 17:8" },
    ],
  },
  {
    slug: "kadesh",
    name: "Kadesh",
    lat: 30.63,
    lon: 34.42,
    label: { dx: 12, dy: 5, anchor: "start" },
    clues: [
      { text: "Miriam died and was buried", ref: "Numbers 20:1" },
      { text: "Struck the rock instead of speaking", ref: "Numbers 20:8–11" },
    ],
  },
];

/** Where the journey began; drawn on the map but never asked about. */
export const START = { name: "Rameses", lat: 30.8, lon: 31.83 };

/** Modern names for orientation, drawn quietly underneath. */
export const MODERN_LABELS: {
  name: string;
  lat: number;
  lon: number;
  kind: "water" | "country";
  /** Degrees clockwise, to run a name along a gulf. */
  rotate?: number;
}[] = [
  { name: "Mediterranean Sea", lat: 31.33, lon: 33.0, kind: "water" },
  { name: "Gulf of Suez", lat: 28.32, lon: 33.4, kind: "water", rotate: 63 },
  { name: "Gulf of Aqaba", lat: 28.3, lon: 34.56, kind: "water", rotate: -74 },
  { name: "Red Sea", lat: 28.0, lon: 34.1, kind: "water" },
  { name: "Egypt", lat: 28.6, lon: 31.75, kind: "country" },
  { name: "Israel", lat: 30.95, lon: 34.9, kind: "country" },
  { name: "Jordan", lat: 30.1, lon: 35.13, kind: "country" },
  { name: "Saudi Arabia", lat: 28.3, lon: 35.05, kind: "country" },
];

/** Latitude and longitude to map units in the SVG viewBox. */
export function project(lat: number, lon: number) {
  const { west, east, north, south } = MAP_BOUNDS;
  return {
    x: ((lon - west) / (east - west)) * MAP_WIDTH,
    y: ((north - lat) / (north - south)) * MAP_HEIGHT,
  };
}

/** Map units back to latitude and longitude. */
export function unproject(x: number, y: number) {
  const { west, east, north, south } = MAP_BOUNDS;
  return {
    lat: north - (y / MAP_HEIGHT) * (north - south),
    lon: west + (x / MAP_WIDTH) * (east - west),
  };
}

/** Great-circle distance in kilometres. */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export const MAX_POINTS = 5000;
export const ROUNDS = 10;

/** Thinking time that costs nothing; after it, each second takes 1% off, down to half. */
export const GRACE_MS = 5000;
const LOSS_PER_SECOND = 0.01;
const MIN_FACTOR = 0.5;

/** The share of a round's points kept after `ms` of thinking. */
export function timeFactor(ms: number) {
  const late = Math.max(0, ms - GRACE_MS) / 1000;
  return Math.max(MIN_FACTOR, 1 - late * LOSS_PER_SECOND);
}

/**
 * Points for a guess made after `ms`. Landing nearest the right place earns
 * the full 5000, since every place is labeled; a miss falls off with distance.
 * Then time takes its share.
 */
export function scoreGuess(guess: { lat: number; lon: number }, answer: Place, ms: number) {
  const km = distanceKm(guess, answer);
  const found = nearestPlace(guess).slug === answer.slug;
  const base = found ? MAX_POINTS : Math.round(MAX_POINTS * Math.exp(-km / 60));
  const factor = timeFactor(ms);
  return { km, found, base, factor, points: Math.round(base * factor) };
}

/** The place a guess landed on: a wilderness it falls inside, or else the closest point. */
function nearestPlace(point: { lat: number; lon: number }) {
  const at = project(point.lat, point.lon);
  const inside = PLACES.find((p) => {
    if (!p.region) return false;
    const c = project(p.lat, p.lon);
    return ((at.x - c.x) / p.region.rx) ** 2 + ((at.y - c.y) / p.region.ry) ** 2 <= 1;
  });
  if (inside) return inside;
  let best = PLACES[0];
  let bestKm = Infinity;
  for (const p of PLACES) {
    const km = distanceKm(point, p);
    if (km < bestKm) [best, bestKm] = [p, km];
  }
  return best;
}
