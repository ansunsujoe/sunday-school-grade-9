import "server-only";
import { asc, count, desc, eq, max, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { mapScores, users } from "@/lib/db/schema";

export type LeaderRow = {
  userId: number;
  name: string;
  role: "teacher" | "student";
  score: number;
  found: number;
  rounds: number;
  durationMs: number;
  games: number;
  rank: number;
};

/**
 * Everyone's best Where in the Wilderness game, highest first. Ties go to the faster
 * game; players with the same score and time share a rank.
 */
export async function getLeaderboard(limit?: number): Promise<LeaderRow[]> {
  const best = db
    .selectDistinctOn([mapScores.userId], {
      userId: mapScores.userId,
      score: mapScores.score,
      found: mapScores.found,
      rounds: mapScores.rounds,
      durationMs: mapScores.durationMs,
    })
    .from(mapScores)
    .orderBy(mapScores.userId, desc(mapScores.score), asc(mapScores.durationMs))
    .as("best");
  const played = db
    .select({ userId: mapScores.userId, games: sql<number>`count(*)::int`.as("games") })
    .from(mapScores)
    .groupBy(mapScores.userId)
    .as("played");

  const query = db
    .select({
      userId: best.userId,
      name: users.name,
      role: users.role,
      score: best.score,
      found: best.found,
      rounds: best.rounds,
      durationMs: best.durationMs,
      games: played.games,
    })
    .from(best)
    .innerJoin(users, eq(users.id, best.userId))
    .innerJoin(played, eq(played.userId, best.userId))
    .orderBy(desc(best.score), asc(best.durationMs), asc(users.name));
  const rows = await (limit ? query.limit(limit) : query);

  let rank = 0;
  return rows.map((row, i) => {
    const prev = rows[i - 1];
    if (!prev || prev.score !== row.score || prev.durationMs !== row.durationMs) rank = i + 1;
    return { ...row, rank };
  });
}

/** A player's own best score and how many games they've played. */
export async function getPersonalBest(userId: number) {
  const [row] = await db
    .select({ best: max(mapScores.score), games: count() })
    .from(mapScores)
    .where(eq(mapScores.userId, userId));
  return { best: row?.best ?? null, games: row?.games ?? 0 };
}
