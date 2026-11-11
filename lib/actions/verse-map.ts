"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { verseMapAttempts } from "@/lib/db/schema";
import {
  MAX_POINTS,
  RETRY_COOLDOWN_MS,
  applyClaim,
  findTerritory,
  firstLetter,
  gradeAnswer,
  gradeLetters,
  isTryMode,
  timeLimitMs,
  verseWords,
  type TryMode,
  type WordMark,
} from "@/lib/verse-map/map";
import { getHolder } from "@/lib/verse-map/queries";
import { VERSE_TEXT } from "@/lib/verse-map/verses";

const PATH = "/activities/world";

// The server's clock runs the timer; a little slack covers the trip back from a phone.
const NETWORK_GRACE_MS = 3_000;

type Fail = { ok: false; error: string };

export type StartedTry = {
  ok: true;
  mode: TryMode;
  attemptId: number;
  territory: string;
  reference: string;
  words: number;
  limitMs: number;
};

export type FinishedTry = {
  ok: true;
  result: "passed" | "missed" | "timeout" | "voided";
  durationMs: number;
  limitMs: number;
  /** The verse, shown once the try is over so mistakes can be learned from. */
  text: string;
  /** How each word of the verse came out. */
  marks: WordMark[];
  /** Words typed that aren't in the verse. */
  extra: number;
  mistakes: number;
  /** Points left out of MAX_POINTS: the soldiers this try is worth. */
  score: number;
  /** What the try did to the territory. */
  outcome: "claimed" | "taken" | "strengthened" | "kept" | "held-off" | "nothing";
  /** The holder before the try, and after it. */
  before: { name: string; soldiers: number; isMe: boolean } | null;
  after: { name: string; soldiers: number; isMe: boolean } | null;
};

/** Voids every try the user still has open, e.g. one abandoned by closing the page. */
async function closeOpenTries(userId: number, note: string) {
  await db
    .update(verseMapAttempts)
    .set({ result: "voided", finishedAt: sql`now()`, note })
    .where(and(eq(verseMapAttempts.userId, userId), isNull(verseMapAttempts.result)));
}

/** Seconds until the user may try `territory` again after a try that scored nothing, or 0. */
async function cooldownLeft(userId: number, territory: string) {
  const [last] = await db
    .select({
      result: verseMapAttempts.result,
      msAgo: sql<number>`(extract(epoch from (now() - ${verseMapAttempts.finishedAt})) * 1000)::int`,
    })
    .from(verseMapAttempts)
    .where(and(eq(verseMapAttempts.userId, userId), eq(verseMapAttempts.territory, territory)))
    .orderBy(desc(verseMapAttempts.startedAt))
    .limit(1);
  if (!last || last.result === "passed" || last.result === null) return 0;
  return Math.max(0, Math.ceil((RETRY_COOLDOWN_MS - last.msAgo) / 1000));
}

/** Starts the clock on a territory's verse, once the honor pledge is made. Only the reference goes back to the browser. */
export async function startTry(territorySlug: string, mode: TryMode, pledged: boolean): Promise<StartedTry | Fail> {
  const user = await requireUser();
  const territory = findTerritory(territorySlug);
  if (!territory) return { ok: false, error: "That territory isn't on the map." };
  if (pledged !== true) return { ok: false, error: "Make the honor pledge before you start." };
  if (!isTryMode(mode)) return { ok: false, error: "Pick first letters or whole words." };

  await closeOpenTries(user.id, "Started another try");
  const wait = await cooldownLeft(user.id, territory.slug);
  if (wait > 0) return { ok: false, error: `Study it a little more. You can try ${territory.name} again in ${wait}s.` };

  const words = verseWords(VERSE_TEXT[territory.reference]).length;
  const [row] = await db
    .insert(verseMapAttempts)
    .values({ userId: user.id, territory: territory.slug, mode })
    .returning({ id: verseMapAttempts.id });
  return {
    ok: true,
    mode,
    attemptId: row.id,
    territory: territory.slug,
    reference: territory.reference,
    words,
    limitMs: timeLimitMs(words, mode),
  };
}

export type TypedLetter =
  | {
      ok: true;
      /** The word just answered, as it's written in the verse. */
      word: string;
      right: boolean;
      /** Mistakes so far in this try. */
      mistakes: number;
      /** Every word is answered, or there are too many mistakes to score: time to finish. */
      done: boolean;
    }
  | { ok: false; error: string; over?: boolean };

/**
 * First-letters mode: records the letter for word `index` and sends back just
 * that word, so the verse reaches the browser one word at a time, and only
 * after it's been answered. The server keeps the letters, so the final grade
 * can't be rewritten after a word is revealed.
 */
export async function typeLetter(attemptId: number, index: number, letter: string): Promise<TypedLetter> {
  const user = await requireUser();
  const key = typeof letter === "string" ? letter.toLowerCase() : "";
  if (!Number.isInteger(attemptId) || !Number.isInteger(index) || !/^[a-z0-9]$/.test(key)) {
    return { ok: false, error: "That letter doesn't add up." };
  }

  const [attempt] = await db
    .select({
      territory: verseMapAttempts.territory,
      result: verseMapAttempts.result,
      mode: verseMapAttempts.mode,
      letters: verseMapAttempts.letters,
      elapsed: sql<number>`(extract(epoch from (now() - ${verseMapAttempts.startedAt})) * 1000)::int`,
    })
    .from(verseMapAttempts)
    .where(and(eq(verseMapAttempts.id, attemptId), eq(verseMapAttempts.userId, user.id)));
  const territory = findTerritory(attempt?.territory);
  if (!attempt || !territory || attempt.mode !== "letters") return { ok: false, error: "That try wasn't found." };
  if (attempt.result !== null) return { ok: false, error: "That try is over.", over: true };

  const tokens = VERSE_TEXT[territory.reference].split(/\s+/);
  if (attempt.elapsed > timeLimitMs(tokens.length, "letters") + NETWORK_GRACE_MS) {
    return { ok: false, error: "Out of time.", over: true };
  }

  let letters = attempt.letters;
  if (index === letters.length && index < tokens.length) {
    // Only appends if no other letter got in first, so the record stays in order.
    const [row] = await db
      .update(verseMapAttempts)
      .set({ letters: sql`${verseMapAttempts.letters} || ${key}` })
      .where(
        and(
          eq(verseMapAttempts.id, attemptId),
          isNull(verseMapAttempts.result),
          sql`char_length(${verseMapAttempts.letters}) = ${index}`,
        ),
      )
      .returning({ letters: verseMapAttempts.letters });
    if (row) letters = row.letters;
  }
  // A repeat of a letter already recorded (say, a retry after a dropped connection) gets the same answer.
  if (index >= letters.length) return { ok: false, error: "That letter came out of order." };

  const right = letters[index] === firstLetter(tokens[index]);
  const mistakes = [...letters].filter((l, i) => l !== firstLetter(tokens[i])).length;
  return {
    ok: true,
    word: tokens[index],
    right,
    mistakes,
    done: letters.length >= tokens.length || mistakes >= MAX_POINTS,
  };
}

/** Grades a typed verse, stops the clock, and settles the territory. */
export async function finishTry(attemptId: number, answer: string): Promise<FinishedTry | Fail> {
  const user = await requireUser();
  if (!Number.isInteger(attemptId) || typeof answer !== "string") return { ok: false, error: "That try doesn't add up." };

  const [attempt] = await db
    .select({
      territory: verseMapAttempts.territory,
      result: verseMapAttempts.result,
      mode: verseMapAttempts.mode,
      letters: verseMapAttempts.letters,
      elapsed: sql<number>`(extract(epoch from (now() - ${verseMapAttempts.startedAt})) * 1000)::int`,
    })
    .from(verseMapAttempts)
    .where(and(eq(verseMapAttempts.id, attemptId), eq(verseMapAttempts.userId, user.id)));
  const territory = findTerritory(attempt?.territory);
  if (!attempt || !territory) return { ok: false, error: "That try wasn't found." };
  if (attempt.result !== null && attempt.result !== "voided") return { ok: false, error: "That try is already over." };

  const text = VERSE_TEXT[territory.reference];
  const limitMs = timeLimitMs(verseWords(text).length, attempt.mode);
  const durationMs = Math.max(0, attempt.elapsed);
  const voided = attempt.result === "voided";
  const late = durationMs > limitMs + NETWORK_GRACE_MS;
  // A voided or late try still shows how it went, but it scores nothing. First letters are graded
  // from the server's own record of them; whatever the browser sends with them is ignored.
  const grade = attempt.mode === "letters" ? gradeLetters(text, attempt.letters) : gradeAnswer(text, answer.slice(0, 4000));
  const score = voided || late ? 0 : grade.score;
  const result: FinishedTry["result"] = voided ? "voided" : late ? "timeout" : score > 0 ? "passed" : "missed";

  const before = await getHolder(territory.slug);
  if (!voided) {
    await db
      .update(verseMapAttempts)
      .set({ result, finishedAt: sql`now()`, durationMs, mistakes: grade.mistakes, score })
      .where(and(eq(verseMapAttempts.id, attemptId), isNull(verseMapAttempts.result)));
  }

  // Teachers can try a territory to test it, but never hold one.
  const counts = user.role === "student" && score > 0;
  const after = counts
    ? applyClaim(territory.slug, before, { userId: user.id, name: user.name, clan: null, score, at: new Date() })
    : before;
  if (counts) revalidatePath(PATH);

  const mine = (h: typeof before) => h?.userId === user.id;
  let outcome: FinishedTry["outcome"] = "nothing";
  if (counts && after) {
    if (!before) outcome = "claimed";
    else if (!mine(before)) outcome = mine(after) ? "taken" : "held-off";
    else outcome = after.soldiers > before.soldiers ? "strengthened" : "kept";
  }
  const view = (h: typeof before) => (h ? { name: h.name, soldiers: h.soldiers, isMe: mine(h) } : null);

  return {
    ok: true,
    result,
    durationMs,
    limitMs,
    text,
    marks: grade.marks,
    extra: grade.extra,
    mistakes: grade.mistakes,
    score,
    outcome,
    before: view(before),
    after: view(after),
  };
}

/** Ends a try early because the player left the page, pasted, or the like. */
export async function voidTry(attemptId: number, reason: string) {
  const user = await requireUser();
  if (!Number.isInteger(attemptId)) return;
  await db
    .update(verseMapAttempts)
    .set({ result: "voided", finishedAt: sql`now()`, score: 0, note: String(reason).slice(0, 120) })
    .where(
      and(eq(verseMapAttempts.id, attemptId), eq(verseMapAttempts.userId, user.id), isNull(verseMapAttempts.result)),
    );
}

/** A territory's verse to study. Opening it voids any try under way. */
export async function studyVerse(territorySlug: string): Promise<{ ok: true; text: string } | Fail> {
  const user = await requireUser();
  const territory = findTerritory(territorySlug);
  if (!territory) return { ok: false, error: "That territory isn't on the map." };
  await closeOpenTries(user.id, "Opened a verse to study");
  return { ok: true, text: VERSE_TEXT[territory.reference] };
}
