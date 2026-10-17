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
    clues: [
      { text: "Sanctifying the firstborn", ref: "Exodus 13:1–2" },
      { text: "Booths", ref: "Name meaning" },
      { text: "The first camp after leaving Rameses", ref: "Numbers 33:5" },
      { text: "Unleavened cakes baked from the dough they brought out of Egypt", ref: "Exodus 12:37–39" },
    ],
  },
  {
    slug: "etham",
    name: "Etham",
    lat: 30.47,
    lon: 32.43,
    label: { dx: 12, dy: -8, anchor: "start" },
    clues: [
      { text: "Camped in the edge of the wilderness", ref: "Exodus 13:20" },
      { text: "A pillar of cloud by day and a pillar of fire by night", ref: "Exodus 13:21–22" },
    ],
  },
  {
    slug: "pihahiroth",
    name: "Pihahiroth",
    lat: 30.06,
    lon: 32.36,
    label: { dx: -12, dy: 5, anchor: "end" },
    clues: [
      { text: "Between Migdol and the sea, over against Baal-zephon", ref: "Exodus 14:2" },
      { text: "“They are entangled in the land, the wilderness hath shut them in”", ref: "Exodus 14:3" },
      { text: "Pharaoh’s horsemen overtook them here", ref: "Exodus 14:9" },
      { text: "“Fear ye not, stand still, and see the salvation of the LORD”", ref: "Exodus 14:13" },
    ],
  },
  {
    slug: "red-sea",
    name: "Red Sea crossing",
    lat: 29.86,
    lon: 32.57,
    label: { dx: -12, dy: 18, anchor: "end" },
    clues: [
      { text: "The waters were a wall on their right hand and on their left", ref: "Exodus 14:22" },
      { text: "A strong east wind all that night", ref: "Exodus 14:21" },
      { text: "“The horse and his rider hath he thrown into the sea”", ref: "Exodus 15:1" },
      { text: "Miriam took a timbrel, and the women went out after her with dances", ref: "Exodus 15:20" },
    ],
  },
  {
    slug: "shur",
    name: "Wilderness of Shur",
    lat: 30.2,
    lon: 33.05,
    region: { rx: 95, ry: 55 },
    label: { dx: 0, dy: -64, anchor: "middle" },
    clues: [
      { text: "Three days without finding any water", ref: "Exodus 15:22" },
      { text: "Separation from the world: its attractions are dry and cannot satisfy", ref: "Lesson 3" },
      { text: "The first wilderness after crossing the sea", ref: "Exodus 15:22" },
    ],
  },
  {
    slug: "marah",
    name: "Marah",
    lat: 29.45,
    lon: 32.88,
    label: { dx: -12, dy: 5, anchor: "end" },
    clues: [
      { text: "Bitter", ref: "Name meaning" },
      { text: "A tree cast into the waters made them sweet", ref: "Exodus 15:25" },
      { text: "“I am the LORD that healeth thee”", ref: "Exodus 15:26" },
      { text: "Diligently hearken, do what is right, give ear to His commandments", ref: "Exodus 15:26" },
    ],
  },
  {
    slug: "elim",
    name: "Elim",
    lat: 29.2,
    lon: 33.03,
    label: { dx: -12, dy: 5, anchor: "end" },
    clues: [
      { text: "Twelve wells of water and threescore and ten palm trees", ref: "Exodus 15:27" },
      { text: "Fellowship with our ministers and fellow believers", ref: "Lesson 3" },
      { text: "An oasis after the bitter water", ref: "Exodus 15:27" },
    ],
  },
  {
    slug: "sin",
    name: "Wilderness of Sin",
    lat: 28.86,
    lon: 33.27,
    region: { rx: 40, ry: 50 },
    label: { dx: -46, dy: 5, anchor: "end" },
    clues: [
      { text: "Bread rained from heaven: manna for the first time", ref: "Exodus 16:4" },
      { text: "Quails came up at evening and covered the camp", ref: "Exodus 16:13" },
      { text: "“Would to God we had died … when we sat by the flesh pots”", ref: "Exodus 16:3" },
      { text: "Jesus, the true bread from heaven, gathered fresh every morning", ref: "John 6:35" },
    ],
  },
  {
    slug: "dophkah",
    name: "Dophkah",
    lat: 29.05,
    lon: 33.46,
    label: { dx: 12, dy: -6, anchor: "start" },
    clues: [
      { text: "Knocking", ref: "Name meaning" },
      { text: "Persistent prayer: keep knocking until the answer comes", ref: "Matthew 7:7" },
      { text: "The camp right after the Wilderness of Sin", ref: "Numbers 33:12" },
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
      { text: "A time of rest and meditation on God’s Word", ref: "Lesson 3" },
      { text: "The last camp before Rephidim", ref: "Numbers 33:13–14" },
    ],
  },
  {
    slug: "rephidim",
    name: "Rephidim",
    lat: 28.7,
    lon: 33.66,
    label: { dx: 12, dy: 10, anchor: "start" },
    clues: [
      { text: "Moses smote the rock in Horeb and water came out", ref: "Exodus 17:6" },
      { text: "Aaron and Hur held up Moses’ hands until the going down of the sun", ref: "Exodus 17:12" },
      { text: "Joshua fought with Amalek", ref: "Exodus 17:9–13" },
      { text: "An altar called Jehovah-nissi: the LORD is my banner", ref: "Exodus 17:15" },
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
      { text: "The Ten Commandments, written on tables of stone", ref: "Exodus 20; 31:18" },
      { text: "The mount quaked greatly and smoked like a furnace", ref: "Exodus 19:18" },
      { text: "Where the tabernacle was first set up", ref: "Exodus 40:17" },
      { text: "Camped nearly a year before the cloud was taken up", ref: "Numbers 10:11–12" },
    ],
  },
  {
    slug: "kibroth-hattaavah",
    name: "Kibroth-hattaavah",
    lat: 28.78,
    lon: 34.22,
    label: { dx: 12, dy: 5, anchor: "start" },
    clues: [
      { text: "Graves of lust", ref: "Name meaning" },
      { text: "“We remember the fish … the cucumbers, and the melons, and the leeks”", ref: "Numbers 11:5" },
      { text: "Quails two cubits deep, and a plague while the flesh was between their teeth", ref: "Numbers 11:31–33" },
      { text: "Seventy elders received the spirit that was upon Moses", ref: "Numbers 11:24–25" },
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
      { text: "Miriam became leprous, white as snow", ref: "Numbers 12:10" },
      { text: "The people did not journey until Miriam was brought in again", ref: "Numbers 12:15" },
      { text: "“The man Moses was very meek, above all the men”", ref: "Numbers 12:3" },
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
      { text: "Twelve men sent to spy out the land of Canaan", ref: "Numbers 13:1–3" },
      { text: "“We were in our own sight as grasshoppers”", ref: "Numbers 13:33" },
      { text: "Forty years of wandering: a year for each day", ref: "Numbers 14:34" },
      { text: "Caleb: “Let us go up at once, and possess it”", ref: "Numbers 13:30" },
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
      { text: "Moses smote the rock twice instead of speaking to it", ref: "Numbers 20:11" },
      { text: "The waters of Meribah, where Moses and Aaron did not sanctify the LORD", ref: "Numbers 20:12–13" },
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
