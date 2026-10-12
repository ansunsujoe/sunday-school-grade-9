import "server-only";
import { cache } from "react";
import { asc, count, desc, eq, ne, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { clanMembers, clans, councilMessages, councilThreads, gameNews, users } from "@/lib/db/schema";
import { CLAN_SLUGS, isClanSlug, type ClanSlug } from "./clans";
import { mannaStatus } from "./manna";
import { withDefaults } from "./resources";
import { DEFAULT_ROLE } from "./roles";
import { settleManna } from "./settle";

/**
 * The signed-in user as a player: teachers see everything, a student sees the
 * clan they lead (or nothing yet, if a teacher hasn't given them one). Settles
 * any manna days that have ended first, so every page shows today's state.
 */
export const getPlayer = cache(async () => {
  const user = await requireUser();
  await settleManna();
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
      fedThrough: clans.fedThrough,
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

export function getNews(limit?: number) {
  const query = db
    .select({
      id: gameNews.id,
      title: gameNews.title,
      content: gameNews.content,
      createdAt: gameNews.createdAt,
      updatedAt: gameNews.updatedAt,
    })
    .from(gameNews)
    .orderBy(desc(gameNews.createdAt), desc(gameNews.id));
  return limit ? query.limit(limit) : query;
}

// --- Council ---------------------------------------------------------------

/** Messages in a thread the player hasn't seen: the character's for a leader, the leader's for teachers. */
function unreadIn(player: Player) {
  return player.isTeacher
    ? sql<number>`(select count(*)::int from ${councilMessages} m where m.thread_id = ${councilThreads.id} and m.from_leader and m.created_at > coalesce(${councilThreads.teacherReadAt}, 'epoch'))`
    : sql<number>`(select count(*)::int from ${councilMessages} m where m.thread_id = ${councilThreads.id} and not m.from_leader and m.created_at > coalesce(${councilThreads.leaderReadAt}, 'epoch'))`;
}

/** Which threads a player may see: every clan's for teachers, their own clan's for a leader. */
function threadsOf(player: Player, clan?: ClanSlug) {
  if (player.isTeacher) return clan ? eq(councilThreads.clanSlug, clan) : undefined;
  return player.clan ? eq(councilThreads.clanSlug, player.clan) : sql`false`;
}

/** Threads newest first, each with its last message and unread count. Teachers can narrow to one clan. */
export function getThreads(player: Player, { clan, limit }: { clan?: ClanSlug; limit?: number } = {}) {
  const last = (column: string) =>
    sql.raw(
      `(select ${column} from council_messages m where m.thread_id = council_threads.id order by m.created_at desc, m.id desc limit 1)`,
    );
  const query = db
    .select({
      id: councilThreads.id,
      clanSlug: councilThreads.clanSlug,
      persona: councilThreads.persona,
      personaTitle: councilThreads.personaTitle,
      lastMessageAt: councilThreads.lastMessageAt,
      lastBody: sql<string | null>`${last("body")}`,
      lastFromLeader: sql<boolean | null>`${last("from_leader")}`,
      lastChanges: sql<Record<string, number> | null>`${last("changes")}`,
      unread: unreadIn(player),
    })
    .from(councilThreads)
    .where(threadsOf(player, clan))
    .orderBy(desc(councilThreads.lastMessageAt), desc(councilThreads.id));
  return limit ? query.limit(limit) : query;
}

export type ThreadListItem = Awaited<ReturnType<typeof getThreads>>[number];

/** One thread the player may see, with its messages oldest first, or a 404. */
export async function getThread(player: Player, id: number) {
  const [thread] = await db.select().from(councilThreads).where(eq(councilThreads.id, id));
  if (!thread || !canSeeClan(player, thread.clanSlug)) notFound();
  const messages = await db
    .select({
      id: councilMessages.id,
      fromLeader: councilMessages.fromLeader,
      kind: councilMessages.kind,
      body: councilMessages.body,
      href: councilMessages.href,
      changes: councilMessages.changes,
      createdAt: councilMessages.createdAt,
    })
    .from(councilMessages)
    .where(eq(councilMessages.threadId, id))
    .orderBy(asc(councilMessages.createdAt), asc(councilMessages.id));
  return { thread, messages };
}

export type CouncilMessage = Awaited<ReturnType<typeof getThread>>["messages"][number];

/** How many messages are waiting for the player across all their threads. */
export async function getCouncilUnread(player: Player) {
  if (!player.isTeacher && !player.clan) return 0;
  const [{ n }] = await db
    .select({ n: sql<number>`coalesce(sum(${unreadIn(player)}), 0)::int` })
    .from(councilThreads)
    .where(threadsOf(player));
  return n;
}

/**
 * What a player should be told on every page: who is waiting for them in the
 * council and, for a leader, whether today's manna still needs collecting.
 * Null when there is nothing to say.
 */
export async function getTentAlert(player: Player) {
  if (!player.isTeacher && !player.clan) return null;
  const waiting = (await getThreads(player)).filter((t) => t.unread > 0);
  const unread = waiting.reduce((sum, t) => sum + t.unread, 0);

  if (player.isTeacher) {
    if (unread === 0) return null;
    return { side: "teacher" as const, unread, waiting, clans: new Set(waiting.map((t) => t.clanSlug)).size };
  }

  const [clan] = await db
    .select({
      fedThrough: clans.fedThrough,
      people: sql<number>`(select count(*)::int from ${clanMembers} where ${clanMembers.clanSlug} = ${clans.slug})`,
    })
    .from(clans)
    .where(eq(clans.slug, player.clan!));
  const manna = clan ? mannaStatus(clan.fedThrough, clan.people) : null;
  // Only once the manna has started (a clan with no fed day yet hasn't begun).
  const hungry = manna !== null && clan.fedThrough !== null && !manna.fed;
  if (unread === 0 && !hungry) return null;
  return { side: "leader" as const, unread, waiting, manna: hungry ? manna : null };
}

export type TentAlert = NonNullable<Awaited<ReturnType<typeof getTentAlert>>>;

/** Everyone in a clan with a role other than Villager: the people who can raise a matter with their leader. */
export function getRoleHolders() {
  return db
    .select({ id: clanMembers.id, clanSlug: clanMembers.clanSlug, name: clanMembers.name, role: clanMembers.role })
    .from(clanMembers)
    .where(ne(clanMembers.role, DEFAULT_ROLE))
    .orderBy(asc(clanMembers.role), asc(clanMembers.name));
}

export type RoleHolder = Awaited<ReturnType<typeof getRoleHolders>>[number];

/** Student accounts, for choosing clan leaders. */
export function getStudentsForLeaders() {
  return db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.role, "student"))
    .orderBy(asc(users.name));
}
