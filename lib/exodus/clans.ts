// The six clans of The Exodus. Each is led by one student; the starting
// rosters are in data/exodus-rosters.json and the logos in public/exodus.

export const CLAN_SLUGS = ["eagle", "lion", "monkey", "bear", "shark", "turtle"] as const;
export type ClanSlug = (typeof CLAN_SLUGS)[number];

export type ClanInfo = {
  slug: ClanSlug;
  name: string;
  animal: string;
  /** First name of the student the clan was made for, used to suggest a leader. */
  founder: string;
  logo: string;
  /** Tailwind classes in the clan's color, written out so Tailwind can see them. */
  accent: { text: string; ring: string; tint: string; glow: string };
};

export const CLANS: ClanInfo[] = [
  {
    slug: "eagle",
    name: "Eagle Clan",
    animal: "Eagle",
    founder: "Caleb",
    logo: "/exodus/eagle.jpg",
    accent: { text: "text-sky-300", ring: "ring-sky-400/40", tint: "bg-sky-400/10", glow: "bg-sky-500/20" },
  },
  {
    slug: "lion",
    name: "Lion Clan",
    animal: "Lion",
    founder: "Jennifer",
    logo: "/exodus/lion.jpg",
    accent: { text: "text-amber-300", ring: "ring-amber-400/40", tint: "bg-amber-400/10", glow: "bg-amber-500/20" },
  },
  {
    slug: "monkey",
    name: "Monkey Clan",
    animal: "Monkey",
    founder: "Jessica",
    logo: "/exodus/monkey.jpg",
    accent: { text: "text-rose-300", ring: "ring-rose-400/40", tint: "bg-rose-400/10", glow: "bg-rose-500/20" },
  },
  {
    slug: "bear",
    name: "Bear Clan",
    animal: "Bear",
    founder: "Keren",
    logo: "/exodus/bear.jpg",
    accent: {
      text: "text-emerald-300",
      ring: "ring-emerald-400/40",
      tint: "bg-emerald-400/10",
      glow: "bg-emerald-500/20",
    },
  },
  {
    slug: "shark",
    name: "Shark Clan",
    animal: "Shark",
    founder: "Riya",
    logo: "/exodus/shark.jpg",
    accent: {
      text: "text-indigo-300",
      ring: "ring-indigo-400/40",
      tint: "bg-indigo-400/10",
      glow: "bg-indigo-500/20",
    },
  },
  {
    slug: "turtle",
    name: "Sea Turtle Clan",
    animal: "Sea Turtle",
    founder: "Noah",
    logo: "/exodus/turtle.jpg",
    accent: { text: "text-teal-300", ring: "ring-teal-400/40", tint: "bg-teal-400/10", glow: "bg-teal-500/20" },
  },
];

export function isClanSlug(value: unknown): value is ClanSlug {
  return typeof value === "string" && (CLAN_SLUGS as readonly string[]).includes(value);
}

export function clanInfo(slug: string): ClanInfo {
  const clan = CLANS.find((c) => c.slug === slug);
  if (!clan) throw new Error(`Unknown clan "${slug}"`);
  return clan;
}
