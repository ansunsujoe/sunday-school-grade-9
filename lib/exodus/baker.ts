import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { clanMembers } from "@/lib/db/schema";
import type { ClanSlug } from "./clans";
import type { Persona } from "./council";
import { BAKER_ROLE, DEFAULT_ROLE } from "./roles";

/**
 * The clan's baker, who comes to the leader's tent about the manna. If the
 * clan has none (say the baker died in a famine), a Villager chosen at random
 * takes up the work, or anyone at all if there are no Villagers left.
 * Returns null only for a clan with no people.
 */
export async function getBaker(slug: ClanSlug): Promise<Persona | null> {
  const isBaker = sql`lower(${clanMembers.role}) = lower(${BAKER_ROLE})`;
  const [baker] = await db
    .select({ name: clanMembers.name })
    .from(clanMembers)
    .where(and(eq(clanMembers.clanSlug, slug), isBaker))
    .orderBy(asc(clanMembers.id))
    .limit(1);
  if (baker) return asPersona(baker.name);

  const [chosen] = await db
    .select({ id: clanMembers.id, name: clanMembers.name })
    .from(clanMembers)
    .where(eq(clanMembers.clanSlug, slug))
    .orderBy(sql`(${clanMembers.role} = ${DEFAULT_ROLE}) desc`, sql`random()`)
    .limit(1);
  if (!chosen) return null;
  await db.update(clanMembers).set({ role: BAKER_ROLE }).where(eq(clanMembers.id, chosen.id));
  return asPersona(chosen.name);
}

const asPersona = (name: string): Persona => ({ name, title: "Baker of your clan" });
