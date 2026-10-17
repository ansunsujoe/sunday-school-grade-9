"use server";

import { revalidatePath } from "next/cache";
import { getLeaderboard, getPersonalBest } from "@/lib/activities/leaderboard";
import { PLACES, ROUNDS, scoreGuess } from "@/lib/activities/places";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { mapScores } from "@/lib/db/schema";

export type MapGuess = { slug: string; lat: number; lon: number; ms: number };

export type SavedMapScore =
  | { ok: true; score: number; rank: number; players: number; personalBest: boolean }
  | { ok: false; error: string };

// A round can't take less than this, or longer than this counts.
const MIN_MS = 300;
const MAX_MS = 10 * 60 * 1000;

/**
 * Records a finished Where in the Wilderness game. The score is worked out again here
 * from the guesses themselves, so the leaderboard only holds real games.
 */
export async function saveMapScore(guesses: MapGuess[]): Promise<SavedMapScore> {
  const user = await requireUser();

  if (!Array.isArray(guesses) || guesses.length !== ROUNDS) return { ok: false, error: "That game wasn't finished." };
  const slugs = new Set(guesses.map((g) => g?.slug));
  if (slugs.size !== ROUNDS) return { ok: false, error: "That game doesn't add up." };

  let score = 0;
  let found = 0;
  let durationMs = 0;
  for (const g of guesses) {
    const place = PLACES.find((p) => p.slug === g.slug);
    if (!place || ![g.lat, g.lon, g.ms].every(Number.isFinite)) return { ok: false, error: "That game doesn't add up." };
    const ms = Math.min(MAX_MS, Math.max(MIN_MS, g.ms));
    const result = scoreGuess({ lat: g.lat, lon: g.lon }, place, ms);
    score += result.points;
    if (result.found) found++;
    durationMs += ms;
  }

  const before = await getPersonalBest(user.id);
  await db.insert(mapScores).values({ userId: user.id, score, found, rounds: ROUNDS, durationMs });
  revalidatePath("/activities/wilderness-map");

  const board = await getLeaderboard();
  const mine = board.find((row) => row.userId === user.id);
  return {
    ok: true,
    score,
    rank: mine?.rank ?? board.length,
    players: board.length,
    personalBest: before.best === null || score > before.best,
  };
}
