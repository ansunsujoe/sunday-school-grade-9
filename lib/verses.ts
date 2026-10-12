import "server-only";
import { asc, desc, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { memoryVerses, type MemoryVerse } from "@/lib/db/schema";

/** The memory verse for the week of `sunday`: the latest one scheduled on or before it. */
export async function getMemoryVerse(sunday: string): Promise<MemoryVerse | null> {
  const [verse] = await db
    .select()
    .from(memoryVerses)
    .where(lte(memoryVerses.sunday, sunday))
    .orderBy(desc(memoryVerses.sunday))
    .limit(1);
  return verse ?? null;
}

/** Every scheduled verse, in Sunday order. */
export function getMemoryVerses() {
  return db.select().from(memoryVerses).orderBy(asc(memoryVerses.sunday));
}

/**
 * Looks up a passage in the KJV (public domain) from bible-api.com, e.g.
 * "John 3:16" or "Psalm 119:9-11". Returns the reference as the API spells it.
 */
export async function lookupKjv(reference: string): Promise<{ reference: string; text: string } | null> {
  const res = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=kjv`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const data: { reference?: string; text?: string } = await res.json();
  const text = data.text?.replace(/\s+/g, " ").trim();
  return data.reference && text ? { reference: data.reference, text } : null;
}
