import "server-only";
import { cache } from "react";
import { and, asc, count, desc, eq, isNull, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import {
  clanMembers,
  clans,
  gameNews,
  gameNotifications,
  scenarioRecipients,
  scenarios,
  users,
} from "@/lib/db/schema";
import { CLAN_SLUGS, isClanSlug, type ClanSlug } from "./clans";
import { withDefaults } from "./resources";

/**
 * The signed-in user as a player: teachers see everything, a student sees the
 * clan they lead (or nothing yet, if a teacher hasn't given them one).
 */
export const getPlayer = cache(async () => {
  const user = await requireUser();
  if (user.role === "teacher") return { user, isTeacher: true as const, clan: null };
  const [row] = await db.select({ slug: clans.slug }).from(clans).where(eq(clans.leaderId, user.id));
  const clan = row && isClanSlug(row.slug) ? row.slug : null;
  return { user, isTeacher: false as const, clan };
});

export type Player = Awaited<ReturnType<typeof getPlayer>>;

/** Whether `player` may see clan `slug`. */
export function canSeeClan(player: Player, slug: string) {
  return player.isTeacher || player.clan === slug;
}

/** Whose notifications a player reads: their clan's, or (for teachers) the teachers' inbox. */
function inboxOf(player: Player) {
  if (player.isTeacher) return isNull(gameNotifications.clanSlug);
  if (player.clan) return eq(gameNotifications.clanSlug, player.clan);
  return sql`false`;
}

/** Whether the game's clans have been created yet. */
export async function isGameSetUp() {
  const [{ n }] = await db.select({ n: count() }).from(clans);
  return n > 0;
}

/** Every clan with its leader and head count, in CLANS order. */
export async function getClans() {
  const rows = await db
    .select({
      slug: clans.slug,
      leaderId: clans.leaderId,
      leaderName: users.name,
      resources: clans.resources,
      people: sql<number>`(select count(*)::int from ${clanMembers} where ${clanMembers.clanSlug} = ${clans.slug})`,
    })
    .from(clans)
    .leftJoin(users, eq(clans.leaderId, users.id));
  return CLAN_SLUGS.flatMap((slug) => {
    const row = rows.find((r) => r.slug === slug);
    return row ? [{ ...row, slug, resources: withDefaults(row.resources) }] : [];
  });
}

export type ClanRow = Awaited<ReturnType<typeof getClans>>[number];

/** One clan the player may see, or a 404. */
export async function getClan(player: Player, slug: string) {
  if (!isClanSlug(slug) || !canSeeClan(player, slug)) notFound();
  const clan = (await getClans()).find((c) => c.slug === slug);
  if (!clan) notFound();
  return clan;
}

export function getClanMembers(slug: ClanSlug) {
  return db
    .select({ id: clanMembers.id, name: clanMembers.name, role: clanMembers.role })
    .from(clanMembers)
    .where(eq(clanMembers.clanSlug, slug))
    .orderBy(asc(clanMembers.id));
}

/** Scenarios newest first. Teachers get all of them with answer counts; a student gets their clan's. */
export async function getScenarios(player: Player) {
  if (player.isTeacher) {
    return db
      .select({
        id: scenarios.id,
        title: scenarios.title,
        closed: scenarios.closed,
        createdAt: scenarios.createdAt,
        sentTo: sql<number>`count(${scenarioRecipients.clanSlug})::int`,
        answered: sql<number>`count(${scenarioRecipients.respondedAt})::int`,
        answeredByMe: sql<boolean>`false`,
      })
      .from(scenarios)
      .leftJoin(scenarioRecipients, eq(scenarioRecipients.scenarioId, scenarios.id))
      .groupBy(scenarios.id)
      .orderBy(desc(scenarios.createdAt), desc(scenarios.id));
  }
  if (!player.clan) return [];
  return db
    .select({
      id: scenarios.id,
      title: scenarios.title,
      closed: scenarios.closed,
      createdAt: scenarios.createdAt,
      sentTo: sql<number>`1`,
      answered: sql<number>`(${scenarioRecipients.respondedAt} is not null)::int`,
      answeredByMe: sql<boolean>`${scenarioRecipients.respondedAt} is not null`,
    })
    .from(scenarios)
    .innerJoin(
      scenarioRecipients,
      and(eq(scenarioRecipients.scenarioId, scenarios.id), eq(scenarioRecipients.clanSlug, player.clan)),
    )
    .orderBy(desc(scenarios.createdAt), desc(scenarios.id));
}

export type ScenarioListItem = Awaited<ReturnType<typeof getScenarios>>[number];

/** A scenario and the answers the player may see (every clan's for teachers, their own for students). */
export async function getScenario(player: Player, id: number) {
  const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, id));
  if (!scenario) notFound();
  const recipients = await db
    .select()
    .from(scenarioRecipients)
    .where(
      and(
        eq(scenarioRecipients.scenarioId, id),
        player.isTeacher ? undefined : eq(scenarioRecipients.clanSlug, player.clan ?? ""),
      ),
    );
  if (!player.isTeacher && recipients.length === 0) notFound();
  return { scenario, recipients };
}

export function getNews(limit?: number) {
  const query = db
    .select({
      id: gameNews.id,
      title: gameNews.title,
      content: gameNews.content,
      createdAt: gameNews.createdAt,
      updatedAt: gameNews.updatedAt,
      author: users.name,
    })
    .from(gameNews)
    .leftJoin(users, eq(gameNews.authorId, users.id))
    .orderBy(desc(gameNews.createdAt), desc(gameNews.id));
  return limit ? query.limit(limit) : query;
}

export function getNotifications(player: Player, limit = 100) {
  return db
    .select()
    .from(gameNotifications)
    .where(inboxOf(player))
    .orderBy(desc(gameNotifications.createdAt), desc(gameNotifications.id))
    .limit(limit);
}

export async function getUnreadNotificationCount(player: Player) {
  const [{ n }] = await db
    .select({ n: count() })
    .from(gameNotifications)
    .where(and(inboxOf(player), eq(gameNotifications.read, false)));
  return n;
}

/** Student accounts, for choosing clan leaders. */
export function getStudentsForLeaders() {
  return db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.role, "student"))
    .orderBy(asc(users.name));
}
