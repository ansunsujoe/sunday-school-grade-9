import "server-only";
import { and, asc, eq, max } from "drizzle-orm";
import { db } from "@/lib/db";
import { clans, users, verseMapAttempts } from "@/lib/db/schema";
import { isClanSlug, type ClanSlug } from "@/lib/exodus/clans";
import { REGIONS, TERRITORIES, applyClaim, type Holder, type RegionSlug } from "./map";

export type { Holder };

/**
 * Who holds each territory, worked out by replaying every scoring try in the
 * order they finished. Teachers' tries never hold ground.
 */
export async function getHolders(): Promise<Holder[]> {
  const rows = await db
    .select({
      territory: verseMapAttempts.territory,
      userId: verseMapAttempts.userId,
      name: users.name,
      clan: clans.slug,
      score: verseMapAttempts.score,
      at: verseMapAttempts.finishedAt,
    })
    .from(verseMapAttempts)
    .innerJoin(users, eq(users.id, verseMapAttempts.userId))
    .leftJoin(clans, eq(clans.leaderId, users.id))
    .where(and(eq(verseMapAttempts.result, "passed"), eq(users.role, "student")))
    .orderBy(asc(verseMapAttempts.finishedAt), asc(verseMapAttempts.id));

  const held = new Map<string, Holder | null>();
  for (const r of rows) {
    const claim = {
      userId: r.userId,
      name: r.name,
      clan: isClanSlug(r.clan) ? r.clan : null,
      score: r.score ?? 0,
      at: r.at ?? new Date(0),
    };
    held.set(r.territory, applyClaim(r.territory, held.get(r.territory) ?? null, claim));
  }
  return [...held.values()].filter((h): h is Holder => h !== null);
}

export async function getHolder(territory: string) {
  return (await getHolders()).find((h) => h.territory === territory) ?? null;
}

export type StandingRow = {
  userId: number;
  name: string;
  clan: ClanSlug | null;
  territories: number;
  soldiers: number;
  /** Regions where this player holds every territory. */
  regions: RegionSlug[];
  rank: number;
};

/** Players by territories held, most first; then soldiers, then whole regions. */
export function standingsFrom(holders: Holder[]): StandingRow[] {
  const byUser = new Map<number, StandingRow>();
  for (const h of holders) {
    const row = byUser.get(h.userId) ?? {
      userId: h.userId,
      name: h.name,
      clan: h.clan,
      territories: 0,
      soldiers: 0,
      regions: [],
      rank: 0,
    };
    row.territories++;
    row.soldiers += h.soldiers;
    byUser.set(h.userId, row);
  }
  for (const region of REGIONS) {
    const inRegion = TERRITORIES.filter((t) => t.region === region.slug);
    const owners = new Set(inRegion.map((t) => holders.find((h) => h.territory === t.slug)?.userId));
    const [only] = owners;
    if (owners.size === 1 && only !== undefined) byUser.get(only)?.regions.push(region.slug);
  }
  const rows = [...byUser.values()].sort(
    (a, b) =>
      b.territories - a.territories ||
      b.soldiers - a.soldiers ||
      b.regions.length - a.regions.length ||
      a.name.localeCompare(b.name),
  );
  let rank = 0;
  return rows.map((row, i) => {
    const prev = rows[i - 1];
    if (!prev || prev.territories !== row.territories || prev.soldiers !== row.soldiers) rank = i + 1;
    return { ...row, rank };
  });
}

/** A player's own best score on each territory they've tried. */
export async function getPersonalBests(userId: number): Promise<Record<string, number>> {
  const rows = await db
    .select({ territory: verseMapAttempts.territory, best: max(verseMapAttempts.score) })
    .from(verseMapAttempts)
    .where(eq(verseMapAttempts.userId, userId))
    .groupBy(verseMapAttempts.territory);
  return Object.fromEntries(rows.filter((r) => r.best !== null).map((r) => [r.territory, r.best ?? 0]));
}
