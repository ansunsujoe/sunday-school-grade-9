import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { councilMessages, councilThreads, type CouncilMessageKind } from "@/lib/db/schema";
import type { ClanSlug } from "./clans";
import type { Persona } from "./council";

type Words = {
  body: string;
  kind?: CouncilMessageKind;
  href?: string;
  /** What this message added to or took from the clan's supplies. */
  changes?: Record<string, number>;
  authorId?: number;
  /** When it was said, if not now (e.g. hunger judged at midnight). */
  createdAt?: Date;
};

/**
 * `persona` says `words` to the leader of each clan in `to`, in that
 * character's thread with the clan (started if it doesn't exist yet).
 * Returns the thread ids, in the same order as `to`.
 */
export async function say(to: readonly ClanSlug[], persona: Persona, words: Words) {
  if (to.length === 0) return [];
  const at = words.createdAt ?? new Date();
  const threads = await db
    .insert(councilThreads)
    .values(to.map((clanSlug) => ({ clanSlug, persona: persona.name, personaTitle: persona.title, lastMessageAt: at })))
    .onConflictDoUpdate({
      target: [councilThreads.clanSlug, councilThreads.persona],
      set: {
        personaTitle: sql`coalesce(excluded.persona_title, ${councilThreads.personaTitle})`,
        lastMessageAt: sql`greatest(${councilThreads.lastMessageAt}, excluded.last_message_at)`,
      },
    })
    .returning({ id: councilThreads.id, clanSlug: councilThreads.clanSlug });

  await db.insert(councilMessages).values(
    threads.map((t) => ({
      threadId: t.id,
      fromLeader: false,
      kind: words.kind ?? "word",
      body: words.body,
      href: words.href,
      changes: words.changes,
      authorId: words.authorId,
      createdAt: at,
    })),
  );
  return to.map((slug) => threads.find((t) => t.clanSlug === slug)!.id);
}
