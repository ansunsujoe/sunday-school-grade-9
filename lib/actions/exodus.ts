"use server";

import { and, eq, inArray, isNull, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import rosters from "@/data/exodus-rosters.json";
import { requireTeacher } from "@/lib/dal";
import { db } from "@/lib/db";
import {
  clanMembers,
  clans,
  gameNews,
  gameNotifications,
  scenarioRecipients,
  scenarios,
  users,
  type NotificationKind,
} from "@/lib/db/schema";
import { CLANS, CLAN_SLUGS, clanInfo, isClanSlug, type ClanSlug } from "@/lib/exodus/clans";
import { canSeeClan, getPlayer } from "@/lib/exodus/queries";
import {
  RESOURCES,
  applyChanges,
  describeChanges,
  startingResources,
  withDefaults,
  type Resources,
} from "@/lib/exodus/resources";
import { DEFAULT_ROLE, isClanRole } from "@/lib/exodus/roles";
import type { FormState } from "./types";

// The notification badge lives in the game's layout, so refresh the whole game.
const revalidateGame = () => revalidatePath("/exodus", "layout");

type Notice = { kind: NotificationKind; title: string; body?: string; href?: string };

/** Sends a notification to each clan in `to`, or to the teachers' inbox when `to` is "teachers". */
async function notify(to: readonly ClanSlug[] | "teachers", notice: Notice) {
  const rows =
    to === "teachers" ? [{ ...notice, clanSlug: null }] : to.map((clanSlug) => ({ ...notice, clanSlug }));
  if (rows.length > 0) await db.insert(gameNotifications).values(rows);
}

/** Clan slugs picked in a form's "clans" checkboxes, in CLANS order. */
function readClans(formData: FormData) {
  const picked = new Set(formData.getAll("clans").map(String));
  return CLAN_SLUGS.filter((slug) => picked.has(slug));
}

async function existingClans() {
  return (await db.select({ slug: clans.slug }).from(clans)).map((c) => c.slug).filter(isClanSlug);
}

// --- Setup -----------------------------------------------------------------

/**
 * Creates any clans that don't exist yet, fills them with their starting
 * roster, and makes the student whose first name matches the clan's founder
 * its leader.
 */
export async function setUpGame() {
  await requireTeacher();
  const have = new Set(await existingClans());
  const missing = CLANS.filter((c) => !have.has(c.slug));
  if (missing.length > 0) {
    const students = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.role, "student"));
    const taken = new Set(
      (await db.select({ id: clans.leaderId }).from(clans)).map((c) => c.id).filter((id) => id !== null),
    );
    const firstName = (name: string) => name.trim().split(/\s+/)[0].toLowerCase();

    await db.insert(clans).values(
      missing.map((c) => {
        const leader = students.find((s) => !taken.has(s.id) && firstName(s.name) === c.founder.toLowerCase());
        if (leader) taken.add(leader.id);
        const people = (rosters as Record<string, string[]>)[c.slug].length;
        return { slug: c.slug, leaderId: leader?.id ?? null, resources: startingResources(people) };
      }),
    );
    const people = missing.flatMap((c) =>
      (rosters as Record<string, string[]>)[c.slug].map((name) => ({ clanSlug: c.slug, name, role: DEFAULT_ROLE })),
    );
    if (people.length > 0) await db.insert(clanMembers).values(people);
    await notify(
      missing.map((c) => c.slug),
      {
        kind: "message",
        title: "Your clan sets out from Egypt",
        body: "You lead your clan now. Look after your people, keep them fed and watered, and answer the scenarios the elders send you.",
      },
    );
  }
  revalidateGame();
  redirect("/exodus");
}

export async function setClanLeader(formData: FormData) {
  await requireTeacher();
  const slug = String(formData.get("slug"));
  const raw = String(formData.get("leaderId") ?? "");
  const leaderId = raw ? Number(raw) : null;
  if (!isClanSlug(slug) || (leaderId !== null && !Number.isInteger(leaderId))) return;

  // A student leads at most one clan, so take them off any other clan first.
  if (leaderId !== null) await db.update(clans).set({ leaderId: null }).where(eq(clans.leaderId, leaderId));
  await db.update(clans).set({ leaderId }).where(eq(clans.slug, slug));
  revalidateGame();
}

// --- Clan members ----------------------------------------------------------

/** Changes a member's role. The clan's leader or a teacher may do this. */
export async function setMemberRole(memberId: number, role: string) {
  const player = await getPlayer();
  if (!isClanRole(role) || !Number.isInteger(memberId)) return;
  const [member] = await db
    .select({ clanSlug: clanMembers.clanSlug })
    .from(clanMembers)
    .where(eq(clanMembers.id, memberId));
  if (!member || !canSeeClan(player, member.clanSlug)) return;

  await db.update(clanMembers).set({ role }).where(eq(clanMembers.id, memberId));
  revalidatePath(`/exodus/clans/${member.clanSlug}`);
}

export async function addMember(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const slug = String(formData.get("slug"));
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? DEFAULT_ROLE);
  if (!isClanSlug(slug)) return { error: "Unknown clan." };
  if (!name) return { error: "Enter a name." };
  if (!isClanRole(role)) return { error: "Pick a role." };

  await db.insert(clanMembers).values({ clanSlug: slug, name, role });
  revalidateGame();
  return { success: `${name} joined the ${clanInfo(slug).name}.` };
}

export async function removeMember(formData: FormData) {
  await requireTeacher();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  const [removed] = await db
    .delete(clanMembers)
    .where(eq(clanMembers.id, id))
    .returning({ clanSlug: clanMembers.clanSlug });
  if (removed) revalidatePath(`/exodus/clans/${removed.clanSlug}`);
}

// --- Resources -------------------------------------------------------------

/** Adds to or takes from resources for one or more clans, and tells each clan why. */
export async function adjustResources(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const targets = readClans(formData);
  const reason = String(formData.get("reason") ?? "").trim();

  const changes: Resources = {};
  for (const r of RESOURCES) {
    const raw = String(formData.get(`d_${r.key}`) ?? "").trim();
    if (!raw) continue;
    const delta = Number(raw);
    if (!Number.isInteger(delta)) return { error: `${r.label} must be a whole number.` };
    if (delta !== 0) changes[r.key] = delta;
  }

  if (targets.length === 0) return { error: "Pick at least one clan." };
  if (Object.keys(changes).length === 0) return { error: "Enter at least one change." };

  const rows = await db.select().from(clans).where(inArray(clans.slug, targets));
  for (const row of rows) {
    await db
      .update(clans)
      .set({ resources: applyChanges(withDefaults(row.resources), changes) })
      .where(eq(clans.slug, row.slug));
  }
  await notify(
    rows.map((r) => r.slug).filter(isClanSlug),
    { kind: "resources", title: describeChanges(changes), body: reason || undefined, href: "/exodus" },
  );
  revalidateGame();
  const who = rows.length === CLAN_SLUGS.length ? "every clan" : rows.map((r) => clanInfo(r.slug).name).join(", ");
  return { success: `Updated ${who}.` };
}

// --- Scenarios -------------------------------------------------------------

export async function createScenario(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireTeacher();
  const title = String(formData.get("title") ?? "").trim();
  const prompt = String(formData.get("prompt") ?? "").trim();
  const available = new Set(await existingClans());
  const targets = readClans(formData).filter((slug) => available.has(slug));

  if (!title) return { error: "Give the scenario a title." };
  if (!prompt) return { error: "Describe the scenario." };
  if (targets.length === 0) return { error: "Send it to at least one clan." };

  const [{ id }] = await db
    .insert(scenarios)
    .values({ title, prompt, authorId: user.id })
    .returning({ id: scenarios.id });
  await db.insert(scenarioRecipients).values(targets.map((clanSlug) => ({ scenarioId: id, clanSlug })));
  await notify(targets, {
    kind: "scenario",
    title: `New scenario: ${title}`,
    body: "Your clan must decide. Read it and send your answer.",
    href: `/exodus/scenarios/${id}`,
  });
  revalidateGame();
  redirect(`/exodus/scenarios/${id}`);
}

/** Opens a closed scenario or closes an open one. Closed scenarios can't be answered. */
export async function toggleScenarioClosed(formData: FormData) {
  await requireTeacher();
  const id = Number(formData.get("id"));
  await db
    .update(scenarios)
    .set({ closed: sql`not ${scenarios.closed}` })
    .where(eq(scenarios.id, id));
  revalidateGame();
}

export async function deleteScenario(formData: FormData) {
  await requireTeacher();
  const id = Number(formData.get("id"));
  await db.delete(scenarios).where(eq(scenarios.id, id));
  await db.delete(gameNotifications).where(eq(gameNotifications.href, `/exodus/scenarios/${id}`));
  revalidateGame();
  redirect("/exodus/scenarios");
}

/** A clan leader's written answer to a scenario. They can change it until the scenario closes. */
export async function answerScenario(_: FormState, formData: FormData): Promise<FormState> {
  const player = await getPlayer();
  if (!player.clan) return { error: "Only a clan leader can answer." };
  const id = Number(formData.get("id"));
  const response = String(formData.get("response") ?? "").trim();
  if (!response) return { error: "Write your clan's answer first." };

  const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, id));
  if (!scenario) return { error: "That scenario no longer exists." };
  if (scenario.closed) return { error: "This scenario is closed." };

  const where = and(eq(scenarioRecipients.scenarioId, id), eq(scenarioRecipients.clanSlug, player.clan));
  const [recipient] = await db.select().from(scenarioRecipients).where(where);
  if (!recipient) return { error: "This scenario wasn't sent to your clan." };

  await db.update(scenarioRecipients).set({ response, respondedAt: new Date() }).where(where);
  await notify("teachers", {
    kind: "response",
    title: `${clanInfo(player.clan).name} ${recipient.respondedAt ? "changed their answer to" : "answered"} “${scenario.title}”`,
    body: response.length > 160 ? `${response.slice(0, 157)}…` : response,
    href: `/exodus/scenarios/${id}#${player.clan}`,
  });
  revalidateGame();
  return { success: recipient.respondedAt ? "Answer updated." : "Answer sent to the elders." };
}

// --- News ------------------------------------------------------------------

function readNews(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
  };
}

function validateNews(news: ReturnType<typeof readNews>) {
  if (!news.title) return "Give the article a title.";
  if (!news.content) return "Write the article.";
  return null;
}

export async function createNews(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireTeacher();
  const news = readNews(formData);
  const error = validateNews(news);
  if (error) return { error };

  const [{ id }] = await db
    .insert(gameNews)
    .values({ ...news, authorId: user.id })
    .returning({ id: gameNews.id });
  await notify(await existingClans(), {
    kind: "news",
    title: `News: ${news.title}`,
    href: `/exodus/news/${id}`,
  });
  revalidateGame();
  redirect("/exodus/news");
}

export async function updateNews(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const id = Number(formData.get("id"));
  const news = readNews(formData);
  const error = validateNews(news);
  if (error) return { error };

  await db
    .update(gameNews)
    .set({ ...news, updatedAt: new Date() })
    .where(eq(gameNews.id, id));
  revalidateGame();
  redirect(`/exodus/news/${id}`);
}

export async function deleteNews(formData: FormData) {
  await requireTeacher();
  const id = Number(formData.get("id"));
  await db.delete(gameNews).where(eq(gameNews.id, id));
  await db.delete(gameNotifications).where(eq(gameNotifications.href, `/exodus/news/${id}`));
  revalidateGame();
  redirect("/exodus/news");
}

// --- Notifications ---------------------------------------------------------

/** A teacher's message to one or more clans, delivered as a notification. */
export async function sendMessage(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const targets = readClans(formData);
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (targets.length === 0) return { error: "Pick at least one clan." };
  if (!title) return { error: "Write a message." };

  await notify(targets, { kind: "message", title, body: body || undefined });
  revalidateGame();
  return { success: `Sent to ${targets.length === 1 ? clanInfo(targets[0]).name : `${targets.length} clans`}.` };
}

/** Marks the player's notifications up to and including id `upTo` as read. */
export async function markNotificationsRead(upTo: number) {
  const player = await getPlayer();
  if (!Number.isInteger(upTo) || (!player.isTeacher && !player.clan)) return;
  await db
    .update(gameNotifications)
    .set({ read: true })
    .where(
      and(
        eq(gameNotifications.read, false),
        lte(gameNotifications.id, upTo),
        player.isTeacher ? isNull(gameNotifications.clanSlug) : eq(gameNotifications.clanSlug, player.clan!),
      ),
    );
  revalidateGame();
}
