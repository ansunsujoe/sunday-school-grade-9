import type { ClanSlug } from "@/lib/exodus/clans";

// Verse Royale: a 70-territory world map where every territory is one
// memory verse. Type a verse perfectly and fastest, and you hold its territory.
//
// This file is safe to import in the browser: it has the map and the verse
// references, never the verse text (that stays on the server, in verses.ts).

export const REGION_SLUGS = [
  "europe",
  "south-america",
  "middle-east",
  "oceania",
  "north-america",
  "africa",
  "asia",
] as const;
export type RegionSlug = (typeof REGION_SLUGS)[number];

export type Region = {
  slug: RegionSlug;
  name: string;
  /** The passage the region's verses come from, e.g. "Psalm 119:41–50". */
  passage: string;
  book: string;
  chapter: number;
  /** The first verse; the region's territories take the verses from here on, in order. */
  firstVerse: number;
};

// Listed in the order they're meant to open: through each passage, start to end.
export const REGIONS: Region[] = [
  { slug: "europe", name: "Europe", passage: "Psalm 119:41–50", book: "Psalm", chapter: 119, firstVerse: 41 },
  { slug: "south-america", name: "South America", passage: "Philippians 3:1–7", book: "Philippians", chapter: 3, firstVerse: 1 },
  { slug: "middle-east", name: "Middle East", passage: "Philippians 3:8–14", book: "Philippians", chapter: 3, firstVerse: 8 },
  { slug: "oceania", name: "Oceania", passage: "Philippians 3:15–20", book: "Philippians", chapter: 3, firstVerse: 15 },
  { slug: "north-america", name: "North America", passage: "Hebrews 11:1–11", book: "Hebrews", chapter: 11, firstVerse: 1 },
  { slug: "africa", name: "Africa", passage: "Hebrews 11:12–26", book: "Hebrews", chapter: 11, firstVerse: 12 },
  { slug: "asia", name: "Asia", passage: "Hebrews 11:27–40", book: "Hebrews", chapter: 11, firstVerse: 27 },
];

/**
 * Each region's territories in verse order, with a point inside each as
 * [longitude, latitude]. scripts/build-world-map.ts grows the territories'
 * shapes on the real map out from these points (see shapes.ts).
 */
export const LAYOUT: Record<RegionSlug, [name: string, lon: number, lat: number][]> = {
  europe: [
    ["Scandinavia", 15, 63],
    ["Britain", -3, 54],
    ["Prussia", 14, 52],
    ["Russia", 38, 56],
    ["Volga", 52, 58],
    ["France", 2, 47],
    ["Italy", 12.5, 43],
    ["Balkans", 21, 43],
    ["Ukraine", 31, 49],
    ["Iberia", -4, 40],
  ],
  "south-america": [
    ["Gran Colombia", -72, 6],
    ["Andes", -73, -11],
    ["Amazon", -63, -4],
    ["Mato Grosso", -54, -13],
    ["Brazil", -42, -12],
    ["Pampas", -62, -31],
    ["Patagonia", -68, -44],
  ],
  "middle-east": [
    ["Steppe", 67, 48],
    ["Turkestan", 64, 39],
    ["Asia Minor", 34, 39],
    ["Caucasus", 45, 41.5],
    ["Israel", 37, 33],
    ["Persia", 54, 32],
    ["Arabia", 45, 23],
  ],
  oceania: [
    ["East Indies", 113, -1],
    ["New Guinea", 139, -4],
    ["Western Australia", 121, -26],
    ["Outback", 134, -24],
    ["Eastern Australia", 146, -27],
    ["New Zealand", 172, -41],
  ],
  "north-america": [
    ["Greenland", -42, 72],
    ["Alaska", -152, 64],
    ["Yukon", -128, 64],
    ["Hudson Bay", -90, 64],
    ["Western Canada", -114, 54],
    ["Eastern Canada", -75, 50],
    ["California", -119, 38],
    ["Wild West", -104, 40],
    ["East Coast", -82, 36],
    ["Mexico", -102, 23],
    ["Central America", -86, 13.5],
  ],
  africa: [
    ["Barbary Coast", 2, 34.5],
    ["Sahara", 6, 26],
    ["Egypt", 30, 27],
    ["Timbuktu", -5, 18],
    ["Chad", 18, 12],
    ["Sudan", 30, 14],
    ["Abyssinia", 40, 9],
    ["Gold Coast", -4, 9],
    ["Nigeria", 8, 9],
    ["Congo", 23, -2],
    ["Zanzibar", 35, -4],
    ["Angola", 17, -12],
    ["Zambezi", 31, -16],
    ["Madagascar", 47, -19],
    ["South Africa", 24, -28],
  ],
  asia: [
    ["Siberia", 75, 62],
    ["Tunguska", 96, 63],
    ["Lena", 122, 64],
    ["Kamchatka", 155, 63],
    ["Sinkiang", 85, 41],
    ["Mongolia", 103, 47],
    ["Manchuria", 126, 45],
    ["Tibet", 88, 32],
    ["Peking", 114, 36],
    ["Japan", 138, 37],
    ["India", 79, 24],
    ["Canton", 110, 25],
    ["Ceylon", 78, 13],
    ["Siam", 101, 16],
  ],
};

export type Territory = {
  slug: string;
  name: string;
  region: RegionSlug;
  /** e.g. "Hebrews 11:4". */
  reference: string;
  lon: number;
  lat: number;
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export const TERRITORIES: Territory[] = REGIONS.flatMap((region) =>
  LAYOUT[region.slug].map(([name, lon, lat], i) => ({
    slug: slugify(name),
    name,
    region: region.slug,
    reference: `${region.book} ${region.chapter}:${region.firstVerse + i}`,
    lon,
    lat,
  })),
);

export function isRegionSlug(value: unknown): value is RegionSlug {
  return typeof value === "string" && (REGION_SLUGS as readonly string[]).includes(value);
}

export function regionInfo(slug: RegionSlug): Region {
  return REGIONS.find((r) => r.slug === slug)!;
}

export function findTerritory(slug: unknown): Territory | undefined {
  return typeof slug === "string" ? TERRITORIES.find((t) => t.slug === slug) : undefined;
}

// --- Typing a verse ---------------------------------------------------------

/** A word as it's checked: lowercase letters and digits only, so case and punctuation never count. */
export function normalizeWord(word: string) {
  return word
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** The words of a verse or an answer, ready to compare. */
export function verseWords(text: string) {
  return text.split(/[\s—–-]+/).map(normalizeWord).filter(Boolean);
}

/**
 * Two ways to answer, scored the same: the first letter of each word (checked
 * by the server as you go, each word appearing as you type its letter), or
 * the whole verse typed out and checked at the end.
 */
export const TRY_MODES = ["letters", "words"] as const;
export type TryMode = (typeof TRY_MODES)[number];

export function isTryMode(value: unknown): value is TryMode {
  return typeof value === "string" && (TRY_MODES as readonly string[]).includes(value);
}

/**
 * How long a try may take. First letters: twenty seconds to get going, then a
 * second and a half a word. Whole words: a quarter minute, then two and a half
 * seconds a word to type it out on a phone. Either leaves time to think, but
 * not to look it up.
 */
export function timeLimitMs(wordCount: number, mode: TryMode) {
  return mode === "letters" ? 20_000 + wordCount * 1_500 : 15_000 + wordCount * 2_500;
}

/** The letter a word is answered with in first-letters mode. */
export function firstLetter(word: string) {
  return normalizeWord(word)[0] ?? "";
}

/** After a missed or voided try, how long before the same player can try that territory again. */
export const RETRY_COOLDOWN_MS = 60_000;

// --- Holding ground ----------------------------------------------------------

export type Holder = {
  territory: string;
  userId: number;
  name: string;
  clan: ClanSlug | null;
  /** The score that won or last strengthened the territory. */
  soldiers: number;
  takenAt: Date;
};

export type Claim = { userId: number; name: string; clan: ClanSlug | null; score: number; at: Date };

/**
 * Applies one scoring try to a territory's holder, by the rules of the game:
 * an unclaimed territory goes to anyone who scores; someone else's goes to a
 * score equal to or better than its soldiers; your own only ever gets stronger.
 */
export function applyClaim(territory: string, holder: Holder | null, claim: Claim): Holder | null {
  if (claim.score < 1) return holder;
  if (holder?.userId === claim.userId) {
    return claim.score > holder.soldiers ? { ...holder, soldiers: claim.score } : holder;
  }
  if (holder && claim.score < holder.soldiers) return holder;
  return {
    territory,
    userId: claim.userId,
    name: claim.name,
    clan: claim.clan,
    soldiers: claim.score,
    takenAt: claim.at,
  };
}

// --- Grading -----------------------------------------------------------------

/** A try starts with this many points; each mistake costs one. What's left is the soldiers it's worth. */
export const MAX_POINTS = 5;

export type WordMark = "ok" | "wrong" | "missing";

export type Grade = {
  /** Wrong, missing, and extra words, each counting once. */
  mistakes: number;
  /** Points left, from 0 to MAX_POINTS: the soldiers the try is worth. */
  score: number;
  /** How each word of the verse came out, in order. */
  marks: WordMark[];
  /** Words typed that aren't in the verse at all. */
  extra: number;
};

/**
 * Grades an answer word by word. Mistakes are the fewest wrong, missing, or
 * extra words that turn the answer into the verse, so one skipped word costs
 * one point, not every word after it.
 */
export function gradeAnswer(verse: string, answer: string): Grade {
  const want = verseWords(verse);
  // An answer far longer than the verse is all mistakes anyway; this keeps the table small.
  const got = verseWords(answer).slice(0, want.length * 2 + 10);
  const n = want.length;
  const m = got.length;
  const d = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      d[i][j] = Math.min(d[i - 1][j - 1] + (want[i - 1] === got[j - 1] ? 0 : 1), d[i - 1][j] + 1, d[i][j - 1] + 1);
    }
  }
  // Walk back through the table to see which words were right, wrong, or left out.
  const marks: WordMark[] = new Array(n).fill("ok");
  let extra = 0;
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && want[i - 1] === got[j - 1] && d[i][j] === d[i - 1][j - 1]) {
      i--;
      j--;
    } else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) {
      marks[--i] = "wrong";
      j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      marks[--i] = "missing";
    } else {
      extra++;
      j--;
    }
  }
  const mistakes = d[n][m];
  return { mistakes, score: Math.max(0, MAX_POINTS - mistakes), marks, extra };
}

/**
 * Grades a first-letters answer: one letter per word, in order. A wrong letter
 * is a mistake, and so is every word the time ran out on.
 */
export function gradeLetters(verse: string, letters: string): Grade {
  const want = verseWords(verse);
  const marks: WordMark[] = want.map((w, i) => (i >= letters.length ? "missing" : letters[i] === w[0] ? "ok" : "wrong"));
  const mistakes = marks.filter((m) => m !== "ok").length;
  return { mistakes, score: Math.max(0, MAX_POINTS - mistakes), marks, extra: 0 };
}
