// What a clan owns. Amounts are stored per clan in clans.resources, keyed by
// these keys; a key missing from the database counts as its starting amount.

export type ResourceGroup = "treasury" | "provisions" | "herds" | "camp";

export type ResourceInfo = {
  key: string;
  label: string;
  /** Word shown after the amount, e.g. "120 shekels". */
  unit: string;
  emoji: string;
  group: ResourceGroup;
  start: number;
  hint: string;
};

export const RESOURCE_GROUPS: { key: ResourceGroup; label: string }[] = [
  { key: "treasury", label: "Treasury" },
  { key: "provisions", label: "Food & water" },
  { key: "herds", label: "Flocks & herds" },
  { key: "camp", label: "Camp" },
];

export const RESOURCES: ResourceInfo[] = [
  {
    key: "gold",
    label: "Gold",
    unit: "shekels",
    emoji: "🪙",
    group: "treasury",
    start: 100,
    hint: "The most valuable metal in the camp. Buys almost anything.",
  },
  {
    key: "silver",
    label: "Silver",
    unit: "shekels",
    emoji: "🥈",
    group: "treasury",
    start: 250,
    hint: "Everyday money for trading with other clans and passing merchants.",
  },
  {
    key: "jewels",
    label: "Jewels",
    unit: "pieces",
    emoji: "💎",
    group: "treasury",
    start: 10,
    hint: "Precious stones and jewelry, like those the Egyptians gave (Exodus 12:35).",
  },
  {
    key: "food",
    label: "Food",
    unit: "rations",
    emoji: "🍞",
    group: "provisions",
    start: 0,
    hint: "One ration feeds one person for one day.",
  },
  {
    key: "water",
    label: "Water",
    unit: "skins",
    emoji: "💧",
    group: "provisions",
    start: 0,
    hint: "One skin of water keeps one person going for one day.",
  },
  {
    key: "wells",
    label: "Wells",
    unit: "wells",
    emoji: "🪣",
    group: "provisions",
    start: 1,
    hint: "Each well lets the clan refill its water when the camp stops.",
  },
  {
    key: "sheep",
    label: "Sheep",
    unit: "sheep",
    emoji: "🐑",
    group: "herds",
    start: 60,
    hint: "Wool, milk, and offerings. The heart of a clan's wealth.",
  },
  {
    key: "goats",
    label: "Goats",
    unit: "goats",
    emoji: "🐐",
    group: "herds",
    start: 40,
    hint: "Hardy in the desert. Milk, hair for tents, and meat.",
  },
  {
    key: "cattle",
    label: "Cattle",
    unit: "head",
    emoji: "🐂",
    group: "herds",
    start: 12,
    hint: "Oxen pull carts and plow; cows give milk.",
  },
  {
    key: "donkeys",
    label: "Donkeys",
    unit: "donkeys",
    emoji: "🫏",
    group: "herds",
    start: 8,
    hint: "Carry the clan's goods on the march.",
  },
  {
    key: "tents",
    label: "Tents",
    unit: "tents",
    emoji: "⛺",
    group: "camp",
    start: 30,
    hint: "Shelter from the sun by day and the cold by night.",
  },
  {
    key: "weapons",
    label: "Weapons",
    unit: "swords & spears",
    emoji: "🗡️",
    group: "camp",
    start: 20,
    hint: "To defend the clan from raiders like the Amalekites.",
  },
  {
    key: "morale",
    label: "Morale",
    unit: "/ 100",
    emoji: "🔥",
    group: "camp",
    start: 70,
    hint: "How hopeful the clan is. Low morale leads to grumbling.",
  },
];

/** Resources that can't go above 100. */
export const PERCENT_RESOURCES = new Set(["morale"]);

export type Resources = Record<string, number>;

/** A clan's stored amounts with every resource filled in. */
export function withDefaults(stored: Resources | null | undefined): Resources {
  return Object.fromEntries(RESOURCES.map((r) => [r.key, stored?.[r.key] ?? r.start]));
}

/** Days of food and water every clan starts with, however big it is. */
export const STARTING_DAYS = 20;

/** What a clan of `people` starts with: the same for everyone, except food and water scale with size. */
export function startingResources(people: number): Resources {
  return { ...withDefaults(undefined), food: people * STARTING_DAYS, water: people * STARTING_DAYS };
}

/** Applies changes, keeping every amount at 0 or more (and percents at 100 or less). */
export function applyChanges(current: Resources, changes: Resources): Resources {
  const next = withDefaults(current);
  for (const [key, delta] of Object.entries(changes)) {
    const max = PERCENT_RESOURCES.has(key) ? 100 : Infinity;
    next[key] = Math.min(max, Math.max(0, (next[key] ?? 0) + delta));
  }
  return next;
}

/** e.g. "+50 Gold, −200 Food". */
export function describeChanges(changes: Resources) {
  return RESOURCES.filter((r) => changes[r.key])
    .map((r) => `${changes[r.key] > 0 ? "+" : "−"}${Math.abs(changes[r.key]).toLocaleString()} ${r.label}`)
    .join(", ");
}

/** How many days `amount` rations lasts `people` people, or null if nobody is in the clan. */
export function daysOfSupply(amount: number, people: number) {
  return people > 0 ? Math.floor(amount / people) : null;
}
