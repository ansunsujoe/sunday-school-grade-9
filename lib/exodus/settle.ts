import "server-only";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { clanMembers, clans, type CouncilMessageKind } from "@/lib/db/schema";
import { isClanSlug, type ClanSlug } from "./clans";
import {
  HUNGER_DEATHS,
  addDays,
  endOfDay,
  formatGameDay,
  gameDay,
  isPreparationDay,
  isSabbath,
  type GameDay,
} from "./manna";
import { getBaker } from "./baker";
import { say } from "./say";

/** Where the leader collects the manna: the top of the clan's supplies. */
export const SUPPLIES_HREF = "/exodus#supplies";

/** The clan's baker comes to the tent about the manna. */
async function bakerSays(slug: ClanSlug, body: string, kind: CouncilMessageKind = "word", createdAt?: Date) {
  const baker = await getBaker(slug);
  if (baker) await say([slug], baker, { kind, body, href: SUPPLIES_HREF, createdAt });
}

/**
 * Catches every clan up to today: each day that ended with no food costs the
 * clan HUNGER_DEATHS people, and each new day brings a morning notice. There's
 * no clock running in the background, so this runs whenever someone opens the
 * game. Each clan's day is claimed with a conditional update first, so two
 * requests at once can't settle the same day twice.
 */
export async function settleManna(now = new Date()) {
  const today = gameDay(now);
  const yesterday = addDays(today, -1);
  const rows = await db
    .select({ slug: clans.slug, fedThrough: clans.fedThrough, judgedThrough: clans.judgedThrough })
    .from(clans);

  for (const row of rows) {
    if (!isClanSlug(row.slug) || (row.judgedThrough !== null && row.judgedThrough >= yesterday)) continue;

    // First time: the manna starts today, and today's food is a gift.
    if (row.judgedThrough === null) {
      const [claimed] = await db
        .update(clans)
        .set({ judgedThrough: yesterday, fedThrough: today })
        .where(and(eq(clans.slug, row.slug), isNull(clans.judgedThrough)))
        .returning({ slug: clans.slug });
      if (claimed) await bakerSays(row.slug, startWords(today));
      continue;
    }

    const [claimed] = await db
      .update(clans)
      .set({ judgedThrough: yesterday })
      .where(and(eq(clans.slug, row.slug), eq(clans.judgedThrough, row.judgedThrough)))
      .returning({ slug: clans.slug });
    if (!claimed) continue;

    for (let day = addDays(row.judgedThrough, 1); day <= yesterday; day = addDays(day, 1)) {
      if (row.fedThrough === null || row.fedThrough < day) await starve(row.slug, day);
    }
    await bakerSays(row.slug, morningWords(today, row.fedThrough !== null && row.fedThrough >= today));
  }
}

/** A clan that ate nothing on `day` loses HUNGER_DEATHS people, chosen at random. */
async function starve(slug: ClanSlug, day: GameDay) {
  const dead = await db
    .select({ id: clanMembers.id, name: clanMembers.name })
    .from(clanMembers)
    .where(eq(clanMembers.clanSlug, slug))
    .orderBy(sql`random()`)
    .limit(HUNGER_DEATHS);
  if (dead.length === 0) return;
  await db.delete(clanMembers).where(
    inArray(
      clanMembers.id,
      dead.map((d) => d.id),
    ),
  );

  const when = formatGameDay(day);
  const names = dead.map((d) => d.name).join(", ");
  const count = `${dead.length} ${dead.length === 1 ? "person" : "people"}`;
  await bakerSays(
    slug,
    `Hunger in the camp. No manna was collected on ${when}, and ${count} died: ${names}. Collect it every day before midnight, Central time.`,
    "notice",
    endOfDay(day),
  );
}

// What the baker says, in their own voice.

function startWords(today: GameDay) {
  return `My lord, God is raining down bread from heaven for us (Exodus 16:4). Today's bread is already given, ${formatGameDay(today)}. From tomorrow I will come to you each morning: collect the manna before midnight, Central time, or ${HUNGER_DEATHS} of our people will die. On Saturday we must collect a double portion, for no manna falls on the Sabbath.`;
}

function morningWords(today: GameDay, fed: boolean) {
  if (isSabbath(today)) {
    return fed
      ? "Peace to you on the Sabbath, my lord. No manna fell today, but yesterday's double portion is baked and there is bread for everyone. Rest."
      : `My lord, it is the Sabbath and no manna fell. We collected no double portion yesterday, so there is nothing to bake. ${HUNGER_DEATHS} of our people will die at midnight.`;
  }
  if (isPreparationDay(today)) {
    return "My lord, the manna has fallen. Tomorrow is the Sabbath and none will fall, so please collect a double portion today, enough for two days (Exodus 16:22–26). Before midnight, Central time.";
  }
  return `Good morning, my lord. The manna has fallen. Will you collect today's portion so I can bake? It must be done before midnight, Central time, or ${HUNGER_DEATHS} of our people will die. What we keep overnight spoils (Exodus 16:20).`;
}
